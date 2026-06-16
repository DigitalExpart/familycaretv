import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: any;
  private readonly logger = new Logger(StripeService.name);
  
  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-02-24.acacia' as any, // Bypass TS error on API version
    });
  }

  async createCheckoutSession(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let customerId = user.stripeCustomerId;

    // Create stripe customer if they don't have one
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY || 'price_placeholder';
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:8082';

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: `${baseUrl}/subscription?success=true`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: any;

    if (webhookSecret) {
      try {
        event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } catch (err) {
        this.logger.error(`Webhook signature verification failed: ${err.message}`);
        throw err;
      }
    } else {
      // For local testing without a secret, parse it directly (unsafe for prod!)
      event = JSON.parse(payload.toString());
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as any;
        await this.updateSubscription(subscription);
        break;
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as any;
        await this.cancelSubscription(deletedSub);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async updateSubscription(subscription: any) {
    const customerId = subscription.customer as string;
    
    // Find user by stripeCustomerId
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      include: { referralReceived: true }
    });

    if (!user) {
      this.logger.warn(`No user found for Stripe customer: ${customerId}`);
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      },
    });

    // Handle referral tracking if subscription becomes active
    if (subscription.status === 'active' && user.referralReceived && user.referralReceived.status !== 'PAID') {
      await this.prisma.referral.update({
        where: { id: user.referralReceived.id },
        data: {
          status: 'SUBSCRIBED',
          commissionEligible: true,
        }
      });
    }
  }

  private async cancelSubscription(subscription: any) {
    const customerId = subscription.customer as string;
    
    await this.prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        subscriptionStatus: 'canceled',
      },
    });
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
      }
    });

    if (!user) throw new NotFoundException('User not found');

    // Basic trial logic if they don't have stripe setup yet
    if (user.subscriptionStatus === 'trialing' && !user.trialEndsAt) {
       // Let's grant them 14 days from their account creation
       const created = await this.prisma.user.findUnique({ where: { id: userId } });
       if (!created) throw new NotFoundException('User not found');
       
       const trialEnd = new Date(created.createdAt);
       trialEnd.setDate(trialEnd.getDate() + 14);

       if (new Date() > trialEnd) {
         await this.prisma.user.update({
           where: { id: userId },
           data: { subscriptionStatus: 'expired' }
         });
         return { status: 'expired', trialEndsAt: trialEnd, currentPeriodEnd: null };
       }
       
       return { status: 'trialing', trialEndsAt: trialEnd, currentPeriodEnd: null };
    }

    return {
      status: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt,
      currentPeriodEnd: user.currentPeriodEnd,
    };
  }
}
