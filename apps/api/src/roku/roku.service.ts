import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import * as crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PLAN_LIMITS } from '../common/config/plan-limits.config';

@Injectable()
export class RokuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async generateDeviceCode() {
    const deviceId = crypto.randomUUID();
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.deviceLink.create({
      data: {
        deviceId,
        code,
        expiresAt,
      },
    });

    return {
      deviceId,
      code,
      expiresAt,
    };
  }

  async linkDevice(userId: string, code: string) {
    const link = await this.prisma.deviceLink.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!link) {
      throw new NotFoundException('Invalid or expired linking code');
    }

    if (new Date() > link.expiresAt) {
      await this.prisma.deviceLink.delete({ where: { id: link.id } });
      throw new BadRequestException('Code has expired');
    }

    // Enforce Roku device limit per plan tier
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true },
    });

    // Clean up any orphaned device links for this user to avoid limit lockouts
    await this.prisma.deviceLink.deleteMany({
      where: { userId }
    });

    if (user) {
      const tier = user.planTier as keyof typeof PLAN_LIMITS;
      const limit = PLAN_LIMITS[tier]?.rokuDevices ?? Infinity;

      if (limit !== Infinity) {
        const currentDeviceCount = await this.prisma.deviceLink.count({
          where: { userId, linkedAt: { not: null } },
        });

        if (currentDeviceCount >= limit) {
          const tierName = String(tier) === 'PERSONAL' ? 'Personal' : String(tier);
          throw new BadRequestException(
            `Your ${tierName} plan allows up to ${limit} Roku device${limit === 1 ? '' : 's'}. Upgrade to the Family Plan for up to 3 devices.`
          );
        }
      }
    }

    await this.prisma.deviceLink.update({
      where: { id: link.id },
      data: { 
        userId,
        deviceType: 'roku',
        linkedAt: new Date(),
      },
    });

    return { success: true };
  }

  async getToken(identifier: string) {
    if (!identifier) {
      throw new UnauthorizedException('Missing identifier');
    }

    const link = await this.prisma.deviceLink.findFirst({
      where: { 
        OR: [
          { deviceId: identifier },
          { code: identifier.toUpperCase() }
        ]
      },
      include: { user: true },
    });

    if (!link) {
      throw new UnauthorizedException('Invalid deviceId');
    }

    if (new Date() > link.expiresAt) {
      await this.prisma.deviceLink.delete({ where: { id: link.id } });
      throw new UnauthorizedException('Code has expired');
    }

    if (!link.userId || !link.user) {
      // Not linked yet, client must keep polling
      return { pending: true };
    }

    // Linked! Generate JWT
    const tokens = await this.authService.generateTokens(link.user, 'roku');

    // Clean up
    await this.prisma.deviceLink.delete({ where: { id: link.id } });

    return {
      pending: false,
      token: tokens.accessToken, // Added for backward compatibility with Roku app
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getHome(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, subscriptionStatus: true, trialEndsAt: true, currentPeriodEnd: true }
    });

    // Unified reminders for today
    const reminders = await this.prisma.reminder.findMany({
      where: {
        userId,
        scheduledAt: { gte: today, lt: tomorrow }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    const notifications = await this.prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const verseOfTheDay = await this.prisma.bibleVerse.findFirst({
      where: { scheduledDate: { lte: new Date() } },
      orderBy: { scheduledDate: 'desc' },
    });

    const books = await this.prisma.book.findMany({
      where: {
        OR: [
          { scheduleStart: null, scheduleEnd: null },
          { scheduleStart: { lte: new Date() }, scheduleEnd: { gte: new Date() } }
        ]
      },
      orderBy: { displayOrder: 'asc' }
    });

    return {
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        subscription: {
          active: user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing',
          plan: user?.subscriptionStatus,
          renewal: user?.currentPeriodEnd
        }
      },
      reminders,
      notifications,
      verseOfTheDay,
      books,
      timestamp: new Date().toISOString()
    };
  }

  async getUpdates(userId: string, sinceStr: string) {
    if (!sinceStr) throw new BadRequestException('since parameter is required');
    
    const since = new Date(sinceStr);
    if (isNaN(since.getTime())) throw new BadRequestException('Invalid since date format');

    const notifications = await this.prisma.notification.findMany({
      where: { userId, createdAt: { gt: since } },
      orderBy: { createdAt: 'desc' },
    });

    const updatedTasks = await this.prisma.task.findMany({
      where: { userId, updatedAt: { gt: since } },
    });

    const updatedAppointments = await this.prisma.event.findMany({
      where: { patient: { userId }, type: 'APPOINTMENT', updatedAt: { gt: since } },
    });

    const updatedVerse = await this.prisma.bibleVerse.findFirst({
      where: { scheduledDate: { gt: since, lte: new Date() } },
      orderBy: { scheduledDate: 'desc' },
    });

    return {
      notifications,
      updatedTasks,
      updatedAppointments,
      updatedVerse,
    };
  }

  async getScreensaver(userId: string) {
    // A single verse
    const verse = await this.prisma.bibleVerse.findFirst({
      orderBy: { scheduledDate: 'desc' },
    });

    // A single drawing from the user's patients (or global if none)
    const drawing = await this.prisma.drawing.findFirst({
      where: {
        patient: { userId }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Reminders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const events = await this.prisma.event.findMany({
      where: {
        patient: { userId },
        startDateTime: { gte: today, lt: tomorrow },
      },
      select: { title: true, startDateTime: true },
      orderBy: { startDateTime: 'asc' },
      take: 5,
    });

    const tickerMessages = events.map(e => `${e.title} at ${e.startDateTime.toLocaleTimeString()}`);

    return {
      verse,
      drawingUrl: drawing?.imageUrl || 'https://via.placeholder.com/1920x1080?text=FamilyCare+TV',
      qrCodeUrl: 'https://familycare.tv/link',
      tickerMessages,
    };
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, trialEndsAt: true, currentPeriodEnd: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async getPatients(userId: string) {
    return this.prisma.patient.findMany({
      where: { userId },
      include: {
        doctors: true,
        medications: true,
        events: {
          where: { type: 'APPOINTMENT' },
          orderBy: { startDateTime: 'asc' }
        },
        patientNotes: true,
        contacts: true,
      }
    });
  }

  async getTasks(userId: string) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await this.prisma.task.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      orderBy: { date: 'asc' }
    });

    const morning = tasks.filter(t => t.category === 'MORNING');
    const daytime = tasks.filter(t => t.category === 'DAYTIME');
    const evening = tasks.filter(t => t.category === 'EVENING');
    const completed = tasks.filter(t => t.completed);

    return {
      morning,
      daytime,
      evening,
      completed,
      progress: tasks.length > 0 ? completed.length / tasks.length : 0
    };
  }

  async getKids(userId: string) {
    return this.prisma.childProfile.findMany({
      where: { userId },
      include: {
        tasks: {
          where: { completed: false },
          orderBy: { date: 'asc' }
        },
        events: true,
        notes: true,
      }
    });
  }

  async getPets(userId: string) {
    return this.prisma.pet.findMany({
      where: { userId },
      include: {
        medications: true,
        vaccinations: true,
        notes: true,
      }
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    await this.prisma.deviceLink.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
