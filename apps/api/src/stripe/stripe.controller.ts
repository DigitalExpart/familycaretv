import { Controller, Post, Req, Res, Headers, UseGuards, Get } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createCheckoutSession(@Req() req: any) {
    return this.stripeService.createCheckoutSession(req.user.id);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getSubscriptionStatus(@Req() req: any) {
    return this.stripeService.getSubscriptionStatus(req.user.id);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (!signature) {
      return res.status(400).send('Missing stripe-signature header');
    }

    try {
      // req.rawBody is available because we set rawBody: true in main.ts
      await this.stripeService.handleWebhook(signature, req.rawBody);
      res.status(200).send();
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
