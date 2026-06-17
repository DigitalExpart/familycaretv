import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string) {
    const dbNotifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const readVirtualIds = dbNotifications
      .filter(n => n.actionUrl?.startsWith('read:'))
      .map(n => n.actionUrl!.replace('read:', ''));

    const realDbNotifications = dbNotifications.filter(n => !n.actionUrl?.startsWith('read:'));

    const patients = await this.prisma.patient.findMany({ where: { userId }, select: { id: true } });
    const patientIds = patients.map(p => p.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today.getDay()];

    const todaysMedications = await this.prisma.medication.findMany({
      where: {
        patientId: { in: patientIds },
        daysOfWeek: { hasSome: [todayName, 'Everyday', 'everyday', 'Daily', 'daily'] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: today } }]
      },
      include: { patient: { select: { fullName: true } } }
    });

    const todaysEvents = await this.prisma.event.findMany({
      where: {
        patientId: { in: patientIds },
        startDateTime: { gte: today, lt: tomorrow }
      },
      include: { patient: { select: { fullName: true } } }
    });

    const virtualAlerts: any[] = [];

    todaysMedications.forEach(med => {
      med.timesOfDay.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const taskTime = new Date(today);
        taskTime.setHours(hours, minutes, 0, 0);
        
        const virtualId = `med-${med.id}-${timeStr}`;
        if (!readVirtualIds.includes(virtualId)) {
          virtualAlerts.push({
            id: virtualId,
            userId,
            type: 'MEDICATION_REMINDER',
            title: `Medication Reminder: ${med.name}`,
            message: `It is time for ${med.patient.fullName} to take ${med.name} (${med.dosage || 'as prescribed'}).`,
            isRead: false,
            actionUrl: '/dashboard',
            createdAt: taskTime,
          });
        }
      });
    });

    todaysEvents.forEach(event => {
      const virtualId = `event-${event.id}`;
      if (!readVirtualIds.includes(virtualId)) {
        virtualAlerts.push({
          id: virtualId,
          userId,
          type: 'APPOINTMENT_REMINDER',
          title: `Upcoming Event: ${event.title}`,
          message: `You have an event for ${event.patient.fullName} at ${event.startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          isRead: false,
          actionUrl: '/dashboard',
          createdAt: event.startDateTime,
        });
      }
    });

    const allNotifications = [...realDbNotifications, ...virtualAlerts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allNotifications;
  }

  async markAsRead(userId: string, notificationId: string) {
    if (notificationId.startsWith('med-') || notificationId.startsWith('event-')) {
      return this.prisma.notification.create({
        data: {
          userId,
          title: 'System Tracked Read',
          message: 'Hidden tracking notification',
          type: 'SYSTEM',
          isRead: true,
          actionUrl: `read:${notificationId}`,
        }
      });
    }

    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }
}
