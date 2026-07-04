import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from './events/notification.event';

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

  private getUserLocalTime(timezone: string | null | undefined, date: Date = new Date()): { hours: number, minutes: number, dayName: string } {
    const tz = timezone || 'UTC';
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'long',
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      let hours = 0;
      let minutes = 0;
      let dayName = '';

      for (const part of parts) {
        if (part.type === 'hour') hours = parseInt(part.value, 10);
        if (part.type === 'minute') minutes = parseInt(part.value, 10);
        if (part.type === 'weekday') dayName = part.value;
      }
      
      // Intl handles 24 as 0 sometimes or 24, fix it
      if (hours === 24) hours = 0;

      return { hours, minutes, dayName };
    } catch (e) {
      // Fallback if timezone is invalid
      return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]
      };
    }
  }

  // Run every minute to check what is due
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running Notification Scheduler Cron');
    const now = new Date();
    await this.checkMedications(now);
    await this.checkEvents(now);
    await this.checkTasks(now);
  }

  private async checkMedications(now: Date) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const medications = await this.prisma.medication.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: today } }]
      },
      include: { 
        patient: { 
          select: { 
            fullName: true, 
            userId: true, 
            user: { select: { timezone: true } } 
          } 
        } 
      }
    });

    for (const med of medications) {
      const userTz = med.patient.user?.timezone;
      const localTime = this.getUserLocalTime(userTz, now);

      // Check if it's the right day for this user
      const isRightDay = med.daysOfWeek.some(d => 
        d.toLowerCase() === localTime.dayName.toLowerCase() || 
        d.toLowerCase() === 'everyday' || 
        d.toLowerCase() === 'daily'
      );

      if (!isRightDay) continue;

      for (const timeStr of med.timesOfDay) {
        const { hours, minutes } = this.parseTimeStr(timeStr);
        
        if (localTime.hours === hours && localTime.minutes === minutes) {
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
    // Events have actual Date objects stored in UTC. We check if the event starts in the current minute (UTC).
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

    const tasks = await this.prisma.task.findMany({
      where: {
        time: { not: null },
      },
      include: {
        user: { select: { timezone: true } }
      }
    });

    for (const task of tasks) {
      const userTz = task.user?.timezone;
      const localTime = this.getUserLocalTime(userTz, now);

      let isRightDay = false;
      if (task.isDaily) {
        isRightDay = true;
      } else if (task.daysOfWeek && task.daysOfWeek.length > 0) {
        isRightDay = task.daysOfWeek.some(d => 
          d.toLowerCase() === localTime.dayName.toLowerCase() || 
          d.toLowerCase() === 'everyday' || 
          d.toLowerCase() === 'daily'
        );
      } else if (task.date) {
        // If it's a specific date task, we compare the local date of the user to the task date (ignoring time)
        const localDateFormatter = new Intl.DateTimeFormat('en-US', { timeZone: userTz || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' });
        const localDateParts = localDateFormatter.formatToParts(now);
        let y = 0, m = 0, d = 0;
        for (const part of localDateParts) {
          if (part.type === 'year') y = parseInt(part.value, 10);
          if (part.type === 'month') m = parseInt(part.value, 10);
          if (part.type === 'day') d = parseInt(part.value, 10);
        }
        
        const taskD = new Date(task.date);
        if (taskD.getUTCFullYear() === y && (taskD.getUTCMonth() + 1) === m && taskD.getUTCDate() === d) {
          isRightDay = true;
        }
      }

      if (!isRightDay) continue;

      const { hours, minutes } = this.parseTimeStr(task.time!);
      
      if (localTime.hours === hours && localTime.minutes === minutes) {
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
