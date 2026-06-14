import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async lookupMedication(medication: string, language: 'en' | 'es') {
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

    // 2. Call OpenAI
    const systemPrompt = `You are a medication information assistant.
Return only valid JSON.
Provide educational information only.
Do not diagnose.
Include:
- purpose
- sideEffects
- warnings

Language: ${language}
Medication: ${medication}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      const parsed = JSON.parse(content);

      // 3. Store cache
      const saved = await this.prisma.medicationReference.create({
        data: {
          name: medication.toLowerCase(),
          language,
          purpose: parsed.purpose || '',
          sideEffects: parsed.sideEffects || '',
          warnings: parsed.warnings || '',
        },
      });

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
    } catch (error) {
      console.error('Error looking up medication:', error);
      throw new InternalServerErrorException('Failed to look up medication information.');
    }
  }
}
