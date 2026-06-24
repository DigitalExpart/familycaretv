import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import * as crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';

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

  async getToken(deviceId: string) {
    const link = await this.prisma.deviceLink.findUnique({
      where: { deviceId },
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
      select: { firstName: true, lastName: true, subscriptionStatus: true, trialEndsAt: true }
    });

    const patients = await this.prisma.patient.findMany({
      where: { userId },
      select: { id: true, fullName: true, dateOfBirth: true },
    });

    const todayTasks = await this.prisma.task.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      orderBy: { date: 'asc' },
    });

    const appointments = await this.prisma.event.findMany({
      where: {
        patient: { userId },
        startDateTime: { gte: today, lt: tomorrow },
        type: 'APPOINTMENT',
      },
      orderBy: { startDateTime: 'asc' },
    });

    const medications = await this.prisma.medication.findMany({
      where: { patient: { userId } },
    });

    const kids = await this.prisma.childProfile.findMany({
      where: { userId },
      include: { tasks: true },
    });

    const pets = await this.prisma.pet.findMany({
      where: { userId },
      include: { medications: true, vaccinations: true },
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

    const drawingOfTheDay = await this.prisma.drawing.findFirst({
      where: { patient: { userId } },
      orderBy: { createdAt: 'desc' },
    });

    const music = await this.prisma.musicCategory.findMany({
      include: { tracks: { take: 5 } },
      take: 2,
    });

    return {
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
      },
      patients,
      todayTasks,
      appointments,
      medications,
      kids,
      pets,
      notifications,
      verseOfTheDay,
      drawingOfTheDay,
      music,
      subscription: {
        status: user?.subscriptionStatus,
        trialEndsAt: user?.trialEndsAt,
      }
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
        notes: true,
        emergencyContacts: true,
      }
    });
  }

  async getTasks(userId: string) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await this.prisma.task.findMany({
      where: { userId, dueDate: { gte: today, lt: tomorrow } },
      orderBy: { dueDate: 'asc' }
    });

    const morning = tasks.filter(t => t.dueDate && t.dueDate.getHours() < 12);
    const daytime = tasks.filter(t => t.dueDate && t.dueDate.getHours() >= 12 && t.dueDate.getHours() < 18);
    const evening = tasks.filter(t => t.dueDate && t.dueDate.getHours() >= 18);
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
    return this.prisma.patient.findMany({
      where: { userId, isChild: true },
      include: {
        tasks: {
          where: { completed: false },
          orderBy: { dueDate: 'asc' }
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
