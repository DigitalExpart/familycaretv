import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: any;
  private readonly logger = new Logger(StripeService.name);
  
  // Map Stripe Price IDs → plan tiers
  private readonly priceToTier: Record<string, string> = {};

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-02-24.acacia' as any,
    });

    // Build price → tier mapping from env vars
    const personalPriceId = process.env.STRIPE_PRICE_PERSONAL;
    const familyPriceId = process.env.STRIPE_PRICE_FAMILY;
    if (personalPriceId) this.priceToTier[personalPriceId] = 'PERSONAL';
    if (familyPriceId) this.priceToTier[familyPriceId] = 'FAMILY';
  }

  async createCheckoutSession(userId: string, plan: 'PERSONAL' | 'FAMILY' = 'PERSONAL') {
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

    // Select the correct Stripe Price ID based on plan
    let priceId: string;
    if (plan === 'FAMILY') {
      priceId = process.env.STRIPE_PRICE_FAMILY || '';
    } else {
      priceId = process.env.STRIPE_PRICE_PERSONAL || '';
    }

    if (!priceId) {
      // Fallback to the legacy single price ID
      priceId = process.env.STRIPE_PRICE_ID_MONTHLY || 'price_placeholder';
    }

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
      // No trial_period_days for paid plans — trial is the free tier
      success_url: `${baseUrl}/subscription?success=true&plan=${plan}`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
      metadata: { plan },
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
    
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      include: { referralReceived: true }
    });

    if (!user) {
      this.logger.warn(`No user found for Stripe customer: ${customerId}`);
      return;
    }

    // Determine plan tier from the Stripe Price ID
    let planTier: 'PERSONAL' | 'FAMILY' = 'PERSONAL';
    const items = subscription.items?.data || [];
    for (const item of items) {
      const priceId = item.price?.id;
      if (priceId && this.priceToTier[priceId]) {
        planTier = this.priceToTier[priceId] as 'PERSONAL' | 'FAMILY';
        break;
      }
    }

    // Also check session metadata as fallback
    if (subscription.metadata?.plan) {
      planTier = subscription.metadata.plan as 'PERSONAL' | 'FAMILY';
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        planTier,
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
    
    // When subscription is canceled, revert to FREE_TRIAL (expired)
    await this.prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        subscriptionStatus: 'canceled',
        planTier: 'FREE_TRIAL',
      },
    });
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        planTier: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
      }
    });

    if (!user) throw new NotFoundException('User not found');

    // Basic trial logic if they don't have stripe setup yet
    if (user.planTier === 'FREE_TRIAL' && !user.trialEndsAt) {
       const created = await this.prisma.user.findUnique({ where: { id: userId } });
       if (!created) throw new NotFoundException('User not found');
       
       const trialEnd = new Date(created.createdAt);
       trialEnd.setDate(trialEnd.getDate() + 14);

       if (new Date() > trialEnd) {
         await this.prisma.user.update({
           where: { id: userId },
           data: { subscriptionStatus: 'expired' }
         });
         return { status: 'expired', planTier: user.planTier, trialEndsAt: trialEnd, currentPeriodEnd: null };
       }
       
       return { status: 'trialing', planTier: user.planTier, trialEndsAt: trialEnd, currentPeriodEnd: null };
    }

    return {
      status: user.subscriptionStatus,
      planTier: user.planTier,
      trialEndsAt: user.trialEndsAt,
      currentPeriodEnd: user.currentPeriodEnd,
    };
  }
}
