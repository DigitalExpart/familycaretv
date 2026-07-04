import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey.startsWith('sk-')) {
      this.openai = new OpenAI({ apiKey, timeout: 30000 });
      this.logger.log('[AiService] OpenAI client initialized successfully.');
    } else {
      this.logger.warn('[AiService] OPENAI_API_KEY not set or invalid — AI features disabled.');
    }
  }

  async lookupMedication(medication: string, language: 'en' | 'es' = 'en') {
    this.logger.log(`[AiService] Medication lookup request: "${medication}" (lang: ${language})`);

    // 1. Check cache
    const cached = await this.prisma.medicationReference.findUnique({
      where: {
        name_language: {
          name: medication.toLowerCase(),
          language: language,
        },
      },
    });

    if (cached) {
      this.logger.log(`[AiService] Cache HIT for "${medication}" (${language})`);
      return {
        cached: true,
        data: {
          purpose: cached.purpose,
          sideEffects: cached.sideEffects,
          warnings: cached.warnings,
        },
        disclaimer: 'This information is educational only and does not replace professional medical advice.',
      };
    }

    this.logger.log(`[AiService] Cache MISS for "${medication}" (${language}) — calling OpenAI`);

    // 2. Call OpenAI
    if (!this.openai) {
      this.logger.error('[AiService] OpenAI client is not initialized. Check OPENAI_API_KEY.');
      throw new InternalServerErrorException(
        'AI features are not configured. The OPENAI_API_KEY environment variable is missing or invalid.',
      );
    }

    const systemPrompt = `You are a medication information assistant.
Return only valid JSON with exactly these keys: "purpose", "sideEffects", "warnings".
Each value should be a string (not an array).
Provide educational information only.
Do not diagnose or prescribe.

Language: ${language === 'es' ? 'Spanish' : 'English'}
Medication: ${medication}`;

    try {
      this.logger.log(`[AiService] Sending request to OpenAI (model: gpt-4o)`);
      const startTime = Date.now();

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1000,
      });

      const elapsed = Date.now() - startTime;
      this.logger.log(`[AiService] OpenAI responded in ${elapsed}ms`);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        this.logger.error('[AiService] OpenAI returned empty content');
        throw new Error('No content returned from OpenAI');
      }

      this.logger.log(`[AiService] Raw OpenAI response: ${content.substring(0, 200)}...`);

      let parsed: { purpose?: string; sideEffects?: string; warnings?: string };
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        this.logger.error(`[AiService] Failed to parse OpenAI JSON response: ${content}`);
        throw new Error('OpenAI returned invalid JSON');
      }

      // 3. Store cache
      const saved = await this.prisma.medicationReference.create({
        data: {
          name: medication.toLowerCase(),
          language,
          purpose: typeof parsed.purpose === 'string' ? parsed.purpose : JSON.stringify(parsed.purpose || ''),
          sideEffects: typeof parsed.sideEffects === 'string' ? parsed.sideEffects : JSON.stringify(parsed.sideEffects || ''),
          warnings: typeof parsed.warnings === 'string' ? parsed.warnings : JSON.stringify(parsed.warnings || ''),
        },
      });

      this.logger.log(`[AiService] Cached medication info for "${medication}" (${language})`);

      // 4. Return result
      return {
        cached: false,
        data: {
          purpose: saved.purpose,
          sideEffects: saved.sideEffects,
          warnings: saved.warnings,
        },
        disclaimer: 'This information is educational only and does not replace professional medical advice.',
      };
    } catch (error: any) {
      // Distinguish error types for better debugging
      if (error?.status === 401 || error?.code === 'invalid_api_key') {
        this.logger.error('[AiService] OPENAI_API_KEY is invalid or expired.');
        throw new InternalServerErrorException('AI API key is invalid. Please check configuration.');
      }
      if (error?.status === 429) {
        this.logger.error('[AiService] OpenAI rate limit exceeded or quota exhausted.');
        throw new InternalServerErrorException('AI service is temporarily unavailable due to rate limiting. Please try again later.');
      }
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        this.logger.error('[AiService] OpenAI request timed out.');
        throw new InternalServerErrorException('AI service timed out. Please try again.');
      }

      this.logger.error(`[AiService] Unexpected error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to look up medication information.');
    }
  }
}
