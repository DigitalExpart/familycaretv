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

    const patients = await this.prisma.patient.findMany({ where: { userId }, select: { id: true } });
    const patientIds = patients.map(p => p.id);

    const today = new Date();
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

    const medicationAlerts: any[] = [];
    todaysMedications.forEach(med => {
      med.timesOfDay.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const taskTime = new Date(today);
        taskTime.setHours(hours, minutes, 0, 0);

        medicationAlerts.push({
          id: `med-${med.id}-${timeStr}`,
          userId,
          type: 'MEDICATION_REMINDER',
          title: `Medication Reminder: ${med.name}`,
          message: `It is time for ${med.patient.fullName} to take ${med.name} (${med.dosage || 'as prescribed'}).`,
          isRead: false,
          actionUrl: '/dashboard',
          createdAt: taskTime,
        });
      });
    });

    const allNotifications = [...dbNotifications, ...medicationAlerts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allNotifications;
  }

  async markAsRead(userId: string, notificationId: string) {
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
