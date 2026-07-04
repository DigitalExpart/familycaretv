import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async getMyCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { success: true, data: { referralCode: user.referralCode } };
  }

  async getMyReferrals(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: referrals };
  }

  async getStats(userId: string) {
    const stats = await this.prisma.referral.groupBy({
      by: ['status'],
      where: { referrerId: userId },
      _count: {
        status: true,
      },
    });

    const summary = {
      PENDING: 0,
      REGISTERED: 0,
      SUBSCRIBED: 0,
      PAID: 0,
    };

    stats.forEach(stat => {
      summary[stat.status] = stat._count.status;
    });

    return { success: true, data: summary };
  }

  async validateCode(code: string) {
    if (!code) {
      return { success: false, data: { valid: false } };
    }

    const user = await this.prisma.user.findUnique({
      where: { referralCode: code },
      select: { firstName: true, lastName: true },
    });

    if (!user) {
      return { success: false, data: { valid: false } };
    }

    return {
      success: true,
      data: {
        valid: true,
        referrerName: `${user.firstName} ${user.lastName}`,
      }
    };
  }

  async getAllReferralsForAdmin() {
    return this.prisma.referral.findMany({
      include: {
        referrer: { select: { firstName: true, lastName: true, email: true } },
        referredUser: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin: Manage Referral Codes
  async getAllReferralCodes() {
    return this.prisma.referralCode.findMany({
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReferralCode(data: any) {
    return this.prisma.referralCode.create({
      data,
    });
  }

  async updateReferralCode(id: string, data: any) {
    return this.prisma.referralCode.update({
      where: { id },
      data,
    });
  }

  async deleteReferralCode(id: string) {
    return this.prisma.referralCode.delete({
      where: { id },
    });
  }
}
