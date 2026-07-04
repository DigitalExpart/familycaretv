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
    if (dto.referralCode) {
      referrer = await this.prisma.user.findUnique({
        where: { referralCode: dto.referralCode },
      });
      if (!referrer) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid referral code',
          errors: [],
        });
      }
      if (referrer.email === dto.email) {
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

    if (referrer) {
      await this.prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: user.id,
          status: 'REGISTERED',
        },
      });
    }

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
