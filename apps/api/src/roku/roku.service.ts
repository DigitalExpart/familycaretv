import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RokuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async generateDeviceCode() {
    const deviceId = uuidv4();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
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
      data: { userId },
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
    const tokens = await this.authService.generateTokens(link.user);

    // Clean up
    await this.prisma.deviceLink.delete({ where: { id: link.id } });

    return {
      pending: false,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getDashboard(userId: string) {
    const patients = await this.prisma.patient.findMany({
      where: { userId },
      select: { id: true, fullName: true, dateOfBirth: true },
    });

    // Get today's events for all patients of this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await this.prisma.event.findMany({
      where: {
        patient: { userId },
        startDateTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { startDateTime: 'asc' },
    });

    // Just an example, fetching a verse
    const verse = await this.prisma.bibleVerse.findFirst({
      orderBy: { scheduledDate: 'desc' },
    });

    return {
      patients,
      events,
      verseOfTheDay: verse,
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
}
