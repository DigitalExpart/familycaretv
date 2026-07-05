import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateReferralCode(firstName?: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (firstName) {
      result += `-${firstName.toUpperCase().replace(/[^A-Z]/g, '')}`;
    }
    return result;
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException({
        success: false,
        message: 'Email already exists',
        errors: [],
      });
    }

    let referrer: any = null;
    let usedReferralCodeRecord: any = null;
    const codeToSearch = dto.referralCode || null;

    if (codeToSearch) {
      // 1. First check if it's a custom admin ReferralCode
      usedReferralCodeRecord = await this.prisma.referralCode.findFirst({
        where: { code: { equals: codeToSearch, mode: 'insensitive' } },
        include: { owner: true }
      });

      if (usedReferralCodeRecord) {
        if (usedReferralCodeRecord.status !== 'ACTIVE') {
          throw new BadRequestException({
            success: false,
            message: 'Referral code is no longer active',
            errors: [],
          });
        }
        if (usedReferralCodeRecord.maxUsages && usedReferralCodeRecord.usageCount >= usedReferralCodeRecord.maxUsages) {
          throw new BadRequestException({
            success: false,
            message: 'Referral code usage limit reached',
            errors: [],
          });
        }
        if (usedReferralCodeRecord.expiresAt && new Date() > usedReferralCodeRecord.expiresAt) {
          throw new BadRequestException({
            success: false,
            message: 'Referral code has expired',
            errors: [],
          });
        }
        referrer = usedReferralCodeRecord.owner;
      } else {
        // 2. Fallback to checking if it's a user's personal referral code
        referrer = await this.prisma.user.findFirst({
          where: { referralCode: { equals: codeToSearch, mode: 'insensitive' } },
        });
      }

      if (!usedReferralCodeRecord && !referrer) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid referral code',
          errors: [],
        });
      }

      if (referrer && referrer.email === dto.email) {
        throw new BadRequestException({
          success: false,
          message: 'Cannot use your own referral code',
          errors: [],
        });
      }
    }

    const hash = await bcrypt.hash(dto.password, 12);
    
    // Simple retry mechanism for referral code collision
    let user;
    let attempts = 0;
    while (!user && attempts < 3) {
      try {
        const referralCode = this.generateReferralCode(dto.firstName);
        user = await this.prisma.user.create({
          data: {
            email: dto.email,
            passwordHash: hash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            gender: dto.gender,
            hasConsentedToPrivacy: dto.consent ?? false,
            timezone: dto.timezone,
            referralCode,
            referredById: referrer ? referrer.id : null,
          },
        });
      } catch (e) {
        if (e.code === 'P2002' && e.meta?.target?.includes('referralCode')) {
          attempts++;
        } else {
          throw e;
        }
      }
    }
    
    if (!user) {
      throw new ConflictException('Failed to generate unique referral code');
    }

    if (usedReferralCodeRecord || referrer) {
      await this.prisma.referral.create({
        data: {
          referrerId: referrer ? referrer.id : null,
          referredUserId: user.id,
          status: 'REGISTERED',
          commissionEligible: usedReferralCodeRecord ? (usedReferralCodeRecord.commissionRate > 0) : true,
          usedCode: codeToSearch,
        },
      });
    }

    if (usedReferralCodeRecord) {
      await this.prisma.referralCode.update({
        where: { id: usedReferralCodeRecord.id },
        data: { usageCount: { increment: 1 } }
      });
    }

    // Send Welcome Notification
    await this.prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM',
        title: 'Welcome to FamilyCare TV!',
        message: 'Welcome to the platform! Enjoy your 14-day free personal plan to experience all our features. Upgrade later to keep full access.',
      }
    });

    const tokens = await this.generateTokens(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    return {
      success: true,
      data: {
        user: { id: user.id, email: user.email },
        ...tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid credentials',
        errors: [],
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid credentials',
        errors: [],
      });
    }

    const tokens = await this.generateTokens(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
        ...(dto.timezone ? { timezone: dto.timezone } : {}),
      },
    });

    return {
      success: true,
      data: {
        user: { id: user.id, email: user.email },
        ...tokens,
      },
    };
  }

  async generateTokens(user: any, device?: string) {
    const payload: any = { sub: user.id, email: user.email, role: user.role };
    if (device) {
      payload.device = device;
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'replace_me',
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'replace_me',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
