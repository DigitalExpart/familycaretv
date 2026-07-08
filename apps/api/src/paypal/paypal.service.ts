import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  
  private readonly baseApiUrl = process.env.PAYPAL_ENVIRONMENT === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

  constructor(private prisma: PrismaService) {}

  private async getAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new BadRequestException('PayPal credentials are not configured.');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`${this.baseApiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    if (!response.ok) {
      this.logger.error('Failed to get PayPal access token', data);
      throw new BadRequestException('PayPal Authentication Failed');
    }

    return data.access_token;
  }

  async createSubscription(userId: string, plan: 'PERSONAL' | 'FAMILY' = 'PERSONAL') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const planId = plan === 'FAMILY' 
      ? process.env.PAYPAL_PLAN_ID_FAMILY 
      : process.env.PAYPAL_PLAN_ID_PERSONAL;

    if (!planId) {
      throw new BadRequestException(`PayPal Plan ID for ${plan} is not configured.`);
    }

    const accessToken = await this.getAccessToken();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:8082';

    const response = await fetch(`${this.baseApiUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: user.id, // We embed the user ID here so the webhook knows who it is
        application_context: {
          brand_name: 'FamilyCare TV',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          return_url: `${baseUrl}/subscription?success=true&plan=${plan}&method=paypal`,
          cancel_url: `${baseUrl}/subscription?canceled=true&method=paypal`,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      this.logger.error('Failed to create PayPal subscription', data);
      throw new BadRequestException('Failed to create PayPal subscription');
    }

    // Save the pending paypal subscription ID
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        paypalSubscriptionId: data.id,
        paymentMethod: 'PAYPAL'
      },
    });

    // Find the approval URL
    const approveLink = data.links.find((link: any) => link.rel === 'approve');
    return { url: approveLink?.href };
  }

  async handleWebhook(event: any) {
    this.logger.log(`Received PayPal Webhook: ${event.event_type}`);

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.UPDATED':
        await this.updateSubscription(event.resource);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await this.cancelSubscription(event.resource);
        break;
      default:
        this.logger.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    return { received: true };
  }

  private async updateSubscription(resource: any) {
    const paypalSubscriptionId = resource.id;
    const customId = resource.custom_id; // Our userId
    const status = resource.status.toLowerCase(); // 'active', 'suspended', etc.

    let user;
    if (customId) {
      user = await this.prisma.user.findUnique({ where: { id: customId }, include: { referralReceived: true } });
    }
    
    if (!user) {
      // Fallback lookup
      user = await this.prisma.user.findUnique({ where: { paypalSubscriptionId }, include: { referralReceived: true } });
    }

    if (!user) {
      this.logger.warn(`No user found for PayPal subscription: ${paypalSubscriptionId}`);
      return;
    }

    const planTier = resource.plan_id === process.env.PAYPAL_PLAN_ID_FAMILY ? 'FAMILY' : 'PERSONAL';
    const nextBillingTime = resource.billing_info?.next_billing_time;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        paypalSubscriptionId,
        subscriptionStatus: status === 'active' ? 'active' : status,
        planTier,
        paymentMethod: 'PAYPAL',
        currentPeriodEnd: nextBillingTime ? new Date(nextBillingTime) : null,
      },
    });

    // Handle referral tracking
    if (status === 'active' && user.referralReceived && user.referralReceived.status !== 'PAID') {
      await this.prisma.referral.update({
        where: { id: user.referralReceived.id },
        data: {
          status: 'SUBSCRIBED',
          commissionEligible: true,
        }
      });
    }
  }

  private async cancelSubscription(resource: any) {
    const paypalSubscriptionId = resource.id;
    
    await this.prisma.user.updateMany({
      where: { paypalSubscriptionId },
      data: {
        subscriptionStatus: 'canceled',
        planTier: 'FREE_TRIAL',
      },
    });
  }
}
