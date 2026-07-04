import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PLAN_LIMITS, getSerializableLimits, PlanTierKey, ResourceKey } from '../common/config/plan-limits.config';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Determine whether a user's trial is still active.
   */
  async isTrialActive(userId: string): Promise<{ active: boolean; endsAt: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trialEndsAt: true, createdAt: true, planTier: true },
    });
    if (!user) return { active: false, endsAt: new Date() };

    let endsAt = user.trialEndsAt;
    if (!endsAt) {
      // Compute from createdAt + 14 days
      endsAt = new Date(user.createdAt);
      endsAt.setDate(endsAt.getDate() + 14);
    }

    return { active: new Date() < endsAt, endsAt };
  }

  /**
   * Get full subscription status for a user.
   */
  async getFullStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        planTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        createdAt: true,
      },
    });
    if (!user) return null;

    const tier = user.planTier as PlanTierKey;
    const limits = getSerializableLimits(tier);

    let trialActive = false;
    let trialEndsAt = user.trialEndsAt;

    if (tier === 'FREE_TRIAL') {
      const trial = await this.isTrialActive(userId);
      trialActive = trial.active;
      trialEndsAt = trial.endsAt;

      // Auto-expire if trial ended
      if (!trialActive && user.subscriptionStatus !== 'expired') {
        await this.prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: 'expired' },
        });
      }
    }

    const isActive =
      tier === 'FREE_TRIAL'
        ? trialActive
        : ['active', 'trialing'].includes(user.subscriptionStatus);

    // Get current resource counts
    const counts = await this.getResourceCounts(userId);

    return {
      planTier: tier,
      subscriptionStatus: isActive ? 'active' : user.subscriptionStatus,
      active: isActive,
      trial: tier === 'FREE_TRIAL',
      trialActive,
      trialEndsAt,
      renewal: user.currentPeriodEnd,
      limits,
      usage: counts,
    };
  }

  /**
   * Count all resources for a user.
   */
  async getResourceCounts(userId: string) {
    const [
      patients,
      kids,
      pets,
      medications,
      petMedications,
      appointments,
      childEvents,
      notes,
      childNotes,
      petNotes,
      tasks,
      childTasks,
      petTasks,
      rokuDevices,
      familyMembers,
    ] = await Promise.all([
      this.prisma.patient.count({ where: { userId } }),
      this.prisma.childProfile.count({ where: { userId } }),
      this.prisma.pet.count({ where: { userId } }),
      
      this.prisma.medication.count({ where: { patient: { userId } } }),
      this.prisma.petMedication.count({ where: { pet: { userId } } }),
      
      this.prisma.event.count({ where: { patient: { userId }, type: 'APPOINTMENT' } }),
      this.prisma.childCalendarEvent.count({ where: { child: { userId } } }),
      
      this.prisma.patientNote.count({ where: { patient: { userId } } }),
      this.prisma.childNote.count({ where: { child: { userId } } }),
      this.prisma.petNote.count({ where: { pet: { userId } } }),
      
      this.prisma.task.count({ where: { userId } }),
      this.prisma.childTask.count({ where: { child: { userId } } }),
      this.prisma.petTask.count({ where: { pet: { userId } } }),
      
      this.prisma.deviceLink.count({ where: { userId } }),
      this.prisma.familyMember.count({ where: { ownerId: userId } }),
    ]);

    return { 
      patients, 
      kids, 
      pets, 
      medications: medications + petMedications, 
      appointments: appointments + childEvents, 
      notes: notes + childNotes + petNotes, 
      tasks: tasks + childTasks + petTasks, 
      rokuDevices, 
      familyMembers 
    };
  }

  /**
   * Check if a user can create another resource of the given type.
   * Returns { allowed: true } or { allowed: false, message: string, limit: number, current: number }
   */
  async checkResourceLimit(userId: string, resource: ResourceKey) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true },
    });
    if (!user) return { allowed: false, message: 'User not found', limit: 0, current: 0 };

    const tier = user.planTier as PlanTierKey;
    const limit = PLAN_LIMITS[tier][resource];

    if (limit === Infinity) return { allowed: true };

    const counts = await this.getResourceCounts(userId);
    const current = counts[resource as keyof typeof counts] ?? 0;

    if (current >= limit) {
      const tierName = tier === 'PERSONAL' ? 'Personal' : 'Free Trial';
      const resourceName = resource.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
      return {
        allowed: false,
        message: `Your ${tierName} plan allows up to ${limit} ${resourceName}. Upgrade to the Family Plan for unlimited access.`,
        limit,
        current,
      };
    }

    return { allowed: true };
  }

  /**
   * Get today's AI usage for a user.
   */
  async getAiUsage(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true, timezone: true },
    });
    if (!user) return null;

    const tier = user.planTier as PlanTierKey;
    const limit = PLAN_LIMITS[tier].aiLookupsPerDay;

    if (limit === Infinity) {
      return {
        used: 0,
        limit: -1, // -1 means unlimited
        remaining: -1,
        unlimited: true,
        resetIn: null,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await this.prisma.aiUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const used = usage?.count ?? 0;
    const remaining = Math.max(0, limit - used);

    // Calculate reset time (midnight in user's timezone, simplified to UTC midnight)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const resetInMs = tomorrow.getTime() - Date.now();
    const resetInHours = Math.floor(resetInMs / (1000 * 60 * 60));
    const resetInMinutes = Math.floor((resetInMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      used,
      limit,
      remaining,
      unlimited: false,
      resetIn: `${resetInHours}h ${resetInMinutes}m`,
    };
  }

  /**
   * Check if the user can perform an AI lookup. Returns { allowed, message? }
   */
  async checkAiLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true, subscriptionStatus: true, trialEndsAt: true, createdAt: true },
    });
    if (!user) return { allowed: false, message: 'User not found.' };

    const tier = user.planTier as PlanTierKey;

    // FREE_TRIAL: check if trial is active
    if (tier === 'FREE_TRIAL') {
      const trial = await this.isTrialActive(userId);
      if (!trial.active) {
        return {
          allowed: false,
          message: 'Your 14-day free trial has expired. Subscribe to a plan to access AI medication lookups.',
        };
      }
      return { allowed: true }; // Unlimited during active trial
    }

    // FAMILY: unlimited
    if (tier === 'FAMILY') return { allowed: true };

    // PERSONAL: check daily limit
    const limit = PLAN_LIMITS.PERSONAL.aiLookupsPerDay;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await this.prisma.aiUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const used = usage?.count ?? 0;

    if (used >= limit) {
      return {
        allowed: false,
        message: `You've used all ${limit} AI medication lookups available today with your Personal Plan. Your daily allowance resets tomorrow. Upgrade to the Family Plan for unlimited AI medication assistance.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Record an AI lookup usage for today.
   */
  async recordAiUsage(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.aiUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { count: { increment: 1 } },
      create: { userId, date: today, count: 1 },
    });
  }
}
