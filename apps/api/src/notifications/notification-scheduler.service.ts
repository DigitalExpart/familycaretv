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

  // Run every minute to check what is due
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running Notification Scheduler Cron from Reminders');
    const now = new Date();

    const pendingReminders = await this.prisma.reminder.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: now }
      },
    });

    for (const reminder of pendingReminders) {
      const notifEvent = new NotificationEvent();
      notifEvent.userId = reminder.userId;
      notifEvent.type = reminder.type as any;
      notifEvent.title = reminder.title;
      notifEvent.message = reminder.message || reminder.title;
      notifEvent.actionUrl = '/dashboard';
      notifEvent.priority = 'NORMAL';
      
      this.eventEmitter.emit('notification.create', notifEvent);

      await this.prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'SENT' }
      });
    }
  }
}
