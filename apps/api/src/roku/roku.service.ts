import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PLAN_LIMITS } from '../common/config/plan-limits.config';
import { CalendarAggregatorService } from '../calendar/calendar.service';
import { MusicLibraryService } from '../music-library/music-library.service';

@Injectable()
export class RokuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly calendarService: CalendarAggregatorService,
    private readonly musicLibraryService: MusicLibraryService,
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

  async linkDevice(userId: string, dto: any) {
    const rawCode = (typeof dto === 'string' ? dto : dto.code) || '';
    const codeStr = rawCode.trim().toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');
    const link = await this.prisma.deviceLink.findUnique({
      where: { code: codeStr },
    });

    if (!link) {
      throw new NotFoundException('Invalid or expired linking code');
    }

    if (!link.linkedAt && new Date() > link.expiresAt) {
      await this.prisma.deviceLink.delete({ where: { id: link.id } });
      throw new BadRequestException('Code has expired');
    }

    // Enforce Roku device limit per plan tier (skipped for Platform Admins)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true, role: true },
    });

    // Clean up only unlinked, expired device links for this user (not active paired devices)
    await this.prisma.deviceLink.deleteMany({
      where: {
        userId,
        linkedAt: null,
        expiresAt: { lt: new Date() },
      }
    });

    if (user && user.role !== 'ADMIN') {
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

    const deviceName = (typeof dto === 'object' && dto.deviceName) ? dto.deviceName : 'Roku TV';
    const deviceModel = (typeof dto === 'object' && dto.deviceModel) ? dto.deviceModel : null;
    const appVersion = (typeof dto === 'object' && dto.appVersion) ? dto.appVersion : null;

    await this.prisma.deviceLink.update({
      where: { id: link.id },
      data: { 
        userId,
        deviceType: 'roku',
        deviceName,
        ...(deviceModel ? { deviceModel } : {}),
        ...(appVersion ? { appVersion } : {}),
        linkedAt: new Date(),
        lastSeen: new Date(),
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

    if (!link.linkedAt && new Date() > link.expiresAt) {
      // Only expire codes that haven't been linked yet
      await this.prisma.deviceLink.delete({ where: { id: link.id } });
      throw new UnauthorizedException('Code has expired');
    }

    if (!link.userId || !link.user) {
      // Not linked yet, client must keep polling
      return { pending: true };
    }

    // Linked! Generate JWT
    const tokens = await this.authService.generateTokens(link.user, 'roku');

    // Mark the DeviceLink as token-issued but DO NOT delete it
    // The DeviceLink row persists as the record that this device is paired
    await this.prisma.deviceLink.update({
      where: { id: link.id },
      data: { tokenIssuedAt: new Date() },
    });

    return {
      pending: false,
      token: tokens.accessToken, // Added for backward compatibility with Roku app
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getHome(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, subscriptionStatus: true, trialEndsAt: true, currentPeriodEnd: true }
    });

    const patients = await this.prisma.patient.findMany({
      where: { userId },
      select: { id: true, fullName: true, dateOfBirth: true, gender: true, notes: true }
    });
    const patientIds = patients.map(p => p.id);

    const appointmentsCount = await this.prisma.event.count({
      where: { patientId: { in: patientIds }, type: 'APPOINTMENT' }
    });

    const medications = await this.prisma.medication.findMany({
      where: { 
        patientId: { in: patientIds },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      },
      include: { patient: { select: { fullName: true } } }
    });

    const notes = await this.prisma.patientNote.findMany({
      where: { patientId: { in: patientIds } },
      include: { patient: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const events = await this.prisma.event.findMany({
      where: { patientId: { in: patientIds } },
      include: { patient: { select: { fullName: true } } },
      orderBy: { startDateTime: 'asc' }
    });

    const tasks = await this.prisma.task.findMany({
      where: { userId }
    });

    const reminders = await this.prisma.reminder.findMany({
      where: { userId },
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

    // Find the next upcoming appointment from now
    const now = new Date();
    const futureAppointments = events.filter(e => e.type === 'APPOINTMENT' && new Date(e.startDateTime) >= now);
    const nextAppt = futureAppointments.length > 0 ? futureAppointments[0] : null;

    let upcomingAppointment: any = null;
    if (nextAppt) {
      const apptDate = new Date(nextAppt.startDateTime);
      const isToday = apptDate.toDateString() === now.toDateString();
      const timeStr = apptDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const dateStr = isToday ? `Today at ${timeStr}` : `${apptDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
      
      const diffMs = apptDate.getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      let relativeTime = "";
      if (diffHours > 0 && diffHours <= 24) {
        relativeTime = `In ${diffHours} hour${diffHours === 1 ? '' : 's'} →`;
      } else if (diffHours > 24) {
        const diffDays = Math.round(diffHours / 24);
        relativeTime = `In ${diffDays} day${diffDays === 1 ? '' : 's'} →`;
      } else if (diffHours <= 0 && isToday) {
        relativeTime = "Happening now →";
      }

      upcomingAppointment = {
        id: nextAppt.id,
        title: nextAppt.title,
        patientName: nextAppt.patient?.fullName || "Family Member",
        displayTitle: `Upcoming — ${nextAppt.title} (${nextAppt.patient?.fullName || 'Family'})`,
        displayTime: dateStr,
        relativeTime: relativeTime,
        startDateTime: nextAppt.startDateTime,
        description: nextAppt.description
      };
    }

    const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Family Member';

    return {
      userName,
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        subscription: {
          active: user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing',
          plan: user?.subscriptionStatus,
          renewal: user?.currentPeriodEnd
        }
      },
      stats: {
        patients: patients.length,
        appointments: appointmentsCount,
        medications: medications.length,
        notes: notes.length,
        tasks: tasks.length
      },
      patientCount: patients.length,
      patients,
      medsCount: medications.length,
      medications,
      eventsCount: appointmentsCount,
      events,
      notesCount: notes.length,
      notes,
      reminders: events.length > 0 ? events : reminders,
      tasksCount: tasks.length,
      tasks,
      notifications,
      verseOfTheDay,
      books,
      upcomingAppointment,
      timestamp: new Date().toISOString()
    };
  }

  async getNotes(userId: string) {
    const patients = await this.prisma.patient.findMany({ where: { userId }, select: { id: true } });
    const patientIds = patients.map(p => p.id);
    return this.prisma.patientNote.findMany({
      where: { patientId: { in: patientIds } },
      include: { patient: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMedications(userId: string) {
    const patients = await this.prisma.patient.findMany({ where: { userId }, select: { id: true } });
    const patientIds = patients.map(p => p.id);
    return this.prisma.medication.findMany({
      where: { 
        patientId: { in: patientIds },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      },
      include: { patient: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });
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

  /**
   * Validate a stored token on Roku startup.
   * If the access token is still valid, return success.
   * If not, the Roku app should try refreshing.
   */
  async validateToken(accessToken: string) {
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_SECRET || 'replace_me',
      });
      // Token is valid — confirm user still exists
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, firstName: true },
      });
      if (!user) {
        return { valid: false, reason: 'user_not_found' };
      }
      return { valid: true, userId: user.id };
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        return { valid: false, reason: 'expired' };
      }
      return { valid: false, reason: 'invalid' };
    }
  }

  /**
   * Exchange a refresh token for new access + refresh tokens.
   */
  async refreshToken(refreshTokenStr: string) {
    try {
      const payload = this.jwtService.verify(refreshTokenStr, {
        secret: process.env.JWT_REFRESH_SECRET || 'replace_me',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const tokens = await this.authService.generateTokens(user, 'roku');
      return {
        success: true,
        token: tokens.accessToken,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getUserDevices(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true, role: true },
    });

    const devices = await this.prisma.deviceLink.findMany({
      where: { userId, linkedAt: { not: null } },
      orderBy: { linkedAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        deviceModel: true,
        appVersion: true,
        linkedAt: true,
        lastSeen: true,
      },
    });

    if (user?.role === 'ADMIN') {
      return {
        success: true,
        data: {
          devices,
          planLimit: {
            usedCount: devices.length,
            maxLimit: 999,
            planTier: 'ADMIN',
          },
        },
      };
    }

    const tier = (user?.planTier || 'PERSONAL') as keyof typeof PLAN_LIMITS;
    const maxLimit = PLAN_LIMITS[tier]?.rokuDevices ?? 1;

    return {
      success: true,
      data: {
        devices,
        planLimit: {
          usedCount: devices.length,
          maxLimit: maxLimit === Infinity ? 999 : maxLimit,
          planTier: user?.planTier || 'PERSONAL',
        },
      },
    };
  }

  async removeDevice(userId: string, deviceLinkId: string) {
    const device = await this.prisma.deviceLink.findFirst({
      where: { id: deviceLinkId, userId },
    });

    if (!device) {
      throw new NotFoundException('Device not found or not owned by user');
    }

    await this.prisma.deviceLink.delete({
      where: { id: device.id },
    });

    return { success: true, message: 'Device unlinked successfully' };
  }

  async getAllDevicesForAdmin() {
    const devices = await this.prisma.deviceLink.findMany({
      where: { linkedAt: { not: null } },
      orderBy: { linkedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            planTier: true,
          },
        },
      },
    });

    return {
      success: true,
      data: devices,
    };
  }

  async getMusic() {
    // 1. Fetch tracks uploaded in Admin Dashboard (AudioTrack)
    const adminAudioTracks = await this.prisma.audioTrack.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch tracks in MusicTrack
    let tracks = await this.prisma.musicTrack.findMany({
      where: { enabled: true },
      include: { category: true },
      orderBy: [
        { category: { displayOrder: 'asc' } },
        { displayOrder: 'asc' },
      ],
    });

    if (tracks.length === 0 && adminAudioTracks.length === 0) {
      await this.musicLibraryService.seedDefaultTracksIfEmpty();
      tracks = await this.prisma.musicTrack.findMany({
        where: { enabled: true },
        include: { category: true },
        orderBy: [
          { category: { displayOrder: 'asc' } },
          { displayOrder: 'asc' },
        ],
      });
    }

    const allTracks: any[] = [];

    // Prioritize admin uploaded audio tracks
    for (const a of adminAudioTracks) {
      allTracks.push({
        id: a.id,
        title: a.title,
        artist: 'Admin Library',
        duration: '04:00',
        audioUrl: a.audioUrl || '',
        artworkUrl: 'pkg:/images/icon_music.png',
        category: 'Uploaded Music',
        description: 'Uploaded from Admin Audio Dashboard',
      });
    }

    // Include music library tracks
    for (const t of tracks) {
      allTracks.push({
        id: t.id,
        title: t.title,
        artist: t.category?.name || 'FamilyCare Music',
        duration: '04:00',
        audioUrl: t.audioUrl || '',
        artworkUrl: 'pkg:/images/icon_music.png',
        category: t.category?.name || 'General',
        description: t.description || '',
      });
    }

    return {
      tracks: allTracks,
    };
  }

  async getCalendar(userId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.calendarService.getCalendarEvents(userId, start, end);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    // Only clean up unlinked, expired device codes — never delete paired devices
    await this.prisma.deviceLink.deleteMany({
      where: {
        linkedAt: null,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
