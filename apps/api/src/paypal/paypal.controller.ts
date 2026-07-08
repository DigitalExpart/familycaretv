import { Controller, Post, Body, Req, UseGuards, Headers, HttpCode } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('PayPal')
@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post('create-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a PayPal checkout session' })
  async createSubscription(
    @Req() req: any,
    @Body('plan') plan: 'PERSONAL' | 'FAMILY' = 'PERSONAL',
  ) {
    return this.paypalService.createSubscription(req.user.id, plan);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'PayPal webhook handler' })
  async handleWebhook(@Body() event: any) {
    // Note: In production you should verify the webhook signature here using PayPal-Transmission-Id, etc.
    // For simplicity, we assume the payload is trusted or verified securely.
    return this.paypalService.handleWebhook(event);
  }
}
