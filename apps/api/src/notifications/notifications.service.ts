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

    // Daily & Scheduled Tasks
    const todaysTasks = await this.prisma.task.findMany({
      where: {
        userId,
        time: { not: null },
        OR: [
          { isDaily: true }, 
          { date: { gte: today, lt: tomorrow } },
          { daysOfWeek: { hasSome: [todayName, 'Everyday', 'everyday', 'Daily', 'daily'] } }
        ]
      }
    });

    todaysTasks.forEach(task => {
      const [hours, minutes] = task.time!.split(':').map(Number);
      const taskTime = new Date(today);
      taskTime.setHours(hours, minutes, 0, 0);
      
      const virtualId = `task-${task.id}`;
      if (!readVirtualIds.includes(virtualId)) {
        virtualAlerts.push({
          id: virtualId,
          userId,
          type: 'SYSTEM',
          title: `Task Reminder: ${task.title}`,
          message: `It is time for your task: ${task.title}.`,
          isRead: false,
          actionUrl: '/tasks',
          createdAt: taskTime,
        });
      }
    });

    // Kids Tasks
    const children = await this.prisma.childProfile.findMany({ where: { userId }, select: { id: true, name: true } });
    const childIds = children.map(c => c.id);
    
    const childTasks = await this.prisma.childTask.findMany({
      where: {
        childId: { in: childIds },
        time: { not: null },
        OR: [
          { isDaily: true }, 
          { date: { gte: today, lt: tomorrow } },
          { daysOfWeek: { hasSome: [todayName, 'Everyday', 'everyday', 'Daily', 'daily'] } }
        ]
      },
      include: { child: { select: { name: true } } }
    });

    childTasks.forEach(task => {
      const [hours, minutes] = task.time!.split(':').map(Number);
      const taskTime = new Date(today);
      taskTime.setHours(hours, minutes, 0, 0);
      
      const virtualId = `childtask-${task.id}`;
      if (!readVirtualIds.includes(virtualId)) {
        virtualAlerts.push({
          id: virtualId,
          userId,
          type: 'SYSTEM',
          title: `Kid's Task Reminder: ${task.title}`,
          message: `It is time for ${task.child.name} to do: ${task.title}.`,
          isRead: false,
          actionUrl: '/kids',
          createdAt: taskTime,
        });
      }
    });

    // Pet Tasks
    const pets = await this.prisma.pet.findMany({ where: { userId }, select: { id: true, name: true } });
    const petIds = pets.map(p => p.id);

    const petTasks = await this.prisma.petTask.findMany({
      where: {
        petId: { in: petIds },
        time: { not: null },
        OR: [
          { isDaily: true }, 
          { date: { gte: today, lt: tomorrow } },
          { daysOfWeek: { hasSome: [todayName, 'Everyday', 'everyday', 'Daily', 'daily'] } }
        ]
      },
      include: { pet: { select: { name: true } } }
    });

    petTasks.forEach(task => {
      const [hours, minutes] = task.time!.split(':').map(Number);
      const taskTime = new Date(today);
      taskTime.setHours(hours, minutes, 0, 0);
      
      const virtualId = `pettask-${task.id}`;
      if (!readVirtualIds.includes(virtualId)) {
        virtualAlerts.push({
          id: virtualId,
          userId,
          type: 'SYSTEM',
          title: `Pet Task Reminder: ${task.title}`,
          message: `It is time for ${task.pet.name}'s task: ${task.title}.`,
          isRead: false,
          actionUrl: '/pets',
          createdAt: taskTime,
        });
      }
    });

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
    if (notificationId.startsWith('med-') || notificationId.startsWith('event-') || notificationId.startsWith('task-') || notificationId.startsWith('childtask-') || notificationId.startsWith('pettask-')) {
      const existing = await this.prisma.notification.findFirst({
        where: { userId, actionUrl: `read:${notificationId}` }
      });
      if (existing) return existing;
      
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

  async markAsUnread(userId: string, notificationId: string) {
    if (notificationId.startsWith('med-') || notificationId.startsWith('event-') || notificationId.startsWith('task-') || notificationId.startsWith('childtask-') || notificationId.startsWith('pettask-')) {
      return this.prisma.notification.deleteMany({
        where: { userId, actionUrl: `read:${notificationId}` }
      });
    }

    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: false },
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
