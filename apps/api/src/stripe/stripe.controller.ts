import { Controller, Post, Req, Res, Headers, UseGuards, Get, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe checkout session for a specific plan' })
  @ApiBody({ schema: { properties: { plan: { type: 'string', enum: ['PERSONAL', 'FAMILY'], default: 'PERSONAL' } } } })
  async createCheckoutSession(@Req() req: any, @Body() body: { plan?: 'PERSONAL' | 'FAMILY' }) {
    const plan = body?.plan || 'PERSONAL';
    return this.stripeService.createCheckoutSession(req.user.id, plan);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe subscription status' })
  async getSubscriptionStatus(@Req() req: any) {
    return this.stripeService.getSubscriptionStatus(req.user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (!signature) {
      return res.status(400).send('Missing stripe-signature header');
    }

    try {
      await this.stripeService.handleWebhook(signature, req.rawBody);
      res.status(200).send();
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
