import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from './events/notification.event';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private parseTimeStr(timeStr: string): { hours: number, minutes: number } {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return { hours: 0, minutes: 0 };
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  }

  // Run every minute to check what is due
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running Notification Scheduler Cron');
    
    // We get the current UTC date
    const now = new Date();
    
    await this.checkMedications(now);
    await this.checkEvents(now);
    await this.checkTasks(now);
  }

  private async checkMedications(now: Date) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[now.getDay()];

    const medications = await this.prisma.medication.findMany({
      where: {
        daysOfWeek: { hasSome: [todayName, 'Everyday', 'everyday', 'Daily', 'daily'] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: today } }]
      },
      include: { patient: { select: { fullName: true, userId: true } } }
    });

    for (const med of medications) {
      for (const timeStr of med.timesOfDay) {
        const { hours, minutes } = this.parseTimeStr(timeStr);
        
        // We only trigger if the current hour/minute matches the medication's hour/minute
        // Note: For production, we should probably handle user timezones, but prompt said store in UTC.
        // Assuming hours and minutes in the DB correspond to UTC or the server timezone matches.
        if (now.getHours() === hours && now.getMinutes() === minutes) {
           const event = new NotificationEvent();
           event.userId = med.patient.userId;
           event.type = 'MEDICATION_REMINDER';
           event.title = `Medication Reminder: ${med.name}`;
           event.message = `It is time for ${med.patient.fullName} to take ${med.name} (${med.dosage || 'as prescribed'}).`;
           event.actionUrl = '/dashboard';
           event.priority = 'HIGH';
           
           this.eventEmitter.emit('notification.create', event);
        }
      }
    }
  }

  private async checkEvents(now: Date) {
    // Find events starting exactly in this minute
    const startOfMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0);
    const endOfMinute = new Date(startOfMinute);
    endOfMinute.setMinutes(endOfMinute.getMinutes() + 1);

    const events = await this.prisma.event.findMany({
      where: {
        startDateTime: {
          gte: startOfMinute,
          lt: endOfMinute
        }
      },
      include: { patient: { select: { fullName: true, userId: true } } }
    });

    for (const event of events) {
      const notifEvent = new NotificationEvent();
      notifEvent.userId = event.patient.userId;
      notifEvent.type = 'APPOINTMENT_REMINDER';
      notifEvent.title = `Upcoming Event: ${event.title}`;
      notifEvent.message = `You have an event for ${event.patient.fullName} now.`;
      notifEvent.actionUrl = '/dashboard';
      notifEvent.priority = 'NORMAL';
      
      this.eventEmitter.emit('notification.create', notifEvent);
    }
  }

  private async checkTasks(now: Date) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[now.getDay()];

    const tasks = await this.prisma.task.findMany({
      where: {
        time: { not: null },
        OR: [
          { isDaily: true }, 
          { date: { gte: today, lt: tomorrow } },
          { daysOfWeek: { hasSome: [todayName, 'Everyday', 'everyday', 'Daily', 'daily'] } }
        ]
      }
    });

    for (const task of tasks) {
      const { hours, minutes } = this.parseTimeStr(task.time!);
      
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        const notifEvent = new NotificationEvent();
        notifEvent.userId = task.userId;
        notifEvent.type = 'TASK_REMINDER';
        notifEvent.title = `Task Reminder: ${task.title}`;
        notifEvent.message = `It is time for your task: ${task.title}.`;
        notifEvent.actionUrl = '/tasks';
        notifEvent.priority = 'NORMAL';
        
        this.eventEmitter.emit('notification.create', notifEvent);
      }
    }
  }
}
