import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Subscription')
@ApiBearerAuth()
@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get full subscription status, plan tier, limits, and usage' })
  async getStatus(@Req() req) {
    const userId = req.user.id || req.user.userId;
    return this.subscriptionsService.getFullStatus(userId);
  }

  @Get('ai-usage')
  @ApiOperation({ summary: 'Get today\'s AI medication lookup usage and limit' })
  async getAiUsage(@Req() req) {
    const userId = req.user.id || req.user.userId;
    return this.subscriptionsService.getAiUsage(userId);
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get current resource counts vs plan limits' })
  async getLimits(@Req() req) {
    const userId = req.user.id || req.user.userId;
    const status = await this.subscriptionsService.getFullStatus(userId);
    return {
      planTier: status?.planTier,
      limits: status?.limits,
      usage: status?.usage,
    };
  }
}
