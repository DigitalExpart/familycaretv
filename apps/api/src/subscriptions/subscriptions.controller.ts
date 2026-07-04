import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../database/prisma.service';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private prisma: PrismaService) {}

  @Get('status')
  async getStatus(@Req() req) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return { active: false };

    const isActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
    return {
      active: isActive,
      plan: user.subscriptionStatus, // For now, mapping directly. Ideally Stripe plan name
      trial: user.subscriptionStatus === 'trialing',
      renewal: user.currentPeriodEnd,
      cancelled: user.subscriptionStatus === 'canceled',
    };
  }
}
