import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Allow read requests (GET, OPTIONS, HEAD)
    if (['GET', 'OPTIONS', 'HEAD'].includes(request.method)) {
      return true;
    }

    if (!user) {
      return true; // Let JwtAuthGuard handle auth rejection if required
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionStatus: true, trialEndsAt: true, createdAt: true }
    });

    if (!dbUser) return false;

    // Check if active or trialing
    if (['active', 'trialing'].includes(dbUser.subscriptionStatus)) {
      // Basic fallback trial check if stripe isn't connected yet
      if (dbUser.subscriptionStatus === 'trialing' && !dbUser.trialEndsAt) {
        const trialEnd = new Date(dbUser.createdAt);
        trialEnd.setDate(trialEnd.getDate() + 14);
        if (new Date() > trialEnd) {
          throw new ForbiddenException('Your 14-day free trial has expired. Please subscribe to continue adding or editing records.');
        }
      }
      return true;
    }

    throw new ForbiddenException('An active subscription is required to perform this action.');
  }
}
