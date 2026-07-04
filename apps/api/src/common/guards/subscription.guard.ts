import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Allow read requests (GET, OPTIONS, HEAD) — expired trial users can still view data
    if (['GET', 'OPTIONS', 'HEAD'].includes(request.method)) {
      return true;
    }

    if (!user) {
      return true; // Let JwtAuthGuard handle auth rejection if required
    }

    const userId = user.id || user.userId;
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, planTier: true, trialEndsAt: true, createdAt: true }
    });

    if (!dbUser) return false;

    const tier = dbUser.planTier;

    // PERSONAL or FAMILY with active subscription
    if (tier === 'PERSONAL' || tier === 'FAMILY') {
      if (dbUser.subscriptionStatus === 'active') {
        return true;
      }
      // Allow trialing (e.g. during Stripe trial period)
      if (dbUser.subscriptionStatus === 'trialing') {
        return true;
      }
      throw new ForbiddenException('Your subscription is not active. Please renew to continue.');
    }

    // FREE_TRIAL: check if still within 14-day window
    if (tier === 'FREE_TRIAL') {
      let trialEnd = dbUser.trialEndsAt;
      if (!trialEnd) {
        trialEnd = new Date(dbUser.createdAt);
        trialEnd.setDate(trialEnd.getDate() + 14);
      }

      if (new Date() > trialEnd) {
        // Auto-expire the status
        await this.prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: 'expired' },
        });
        throw new ForbiddenException(
          'Your 14-day free trial has expired. Please subscribe to continue adding or editing records.'
        );
      }
      return true;
    }

    throw new ForbiddenException('An active subscription is required to perform this action.');
  }
}
