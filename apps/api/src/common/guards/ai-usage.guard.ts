import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';

/**
 * Guard for AI medication lookup endpoints.
 * Checks the user's plan tier and daily AI usage before allowing the request.
 * Must be applied AFTER JwtAuthGuard so req.user is populated.
 */
@Injectable()
export class AiUsageGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return true; // Let JwtAuthGuard handle auth

    const userId = user.id || user.userId;
    const result = await this.subscriptionsService.checkAiLimit(userId);

    if (!result.allowed) {
      throw new ForbiddenException(result.message);
    }

    // Record the usage AFTER the check passes.
    // The actual recording happens after the request succeeds,
    // but we pre-authorize here. The controller will call recordAiUsage().
    // Store flag on request so controller knows to record.
    request.aiUsageAuthorized = true;

    return true;
  }
}
