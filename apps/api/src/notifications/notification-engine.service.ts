import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { NotificationEvent } from './events/notification.event';
import { NotificationType } from '@prisma/client';
import { ExpoPushService } from './expo-push.service';

@Injectable()
export class NotificationEngineService {
  private readonly logger = new Logger(NotificationEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly expoPushService: ExpoPushService,
  ) {}

  @OnEvent('notification.create')
  async handleNotificationEvent(event: NotificationEvent) {
    try {
      this.logger.debug(`Received notification event for user ${event.userId}: ${event.title}`);

      // Idempotency check: Do we already have this notification?
      const timeThreshold = new Date();
      timeThreshold.setHours(timeThreshold.getHours() - 12); // Prevent duplicates within 12 hours for same title
      
      const existing = await this.prisma.notification.findFirst({
        where: {
          userId: event.userId,
          title: event.title,
          type: event.type as NotificationType,
          createdAt: {
            gte: timeThreshold
          }
        }
      });

      if (existing) {
        this.logger.debug(`Notification already exists for ${event.title}. Skipping.`);
        return;
      }

      const notification = await this.prisma.notification.create({
        data: {
          userId: event.userId,
          type: event.type as NotificationType,
          title: event.title,
          message: event.message,
          actionUrl: event.actionUrl,
          scheduledAt: event.scheduledAt || new Date(),
          expiresAt: event.expiresAt,
          status: 'PENDING',
          priority: event.priority || 'NORMAL'
        }
      });

      // Pass to Expo push service
      await this.expoPushService.sendPushNotification(notification);

    } catch (error: any) {
      this.logger.error(`Failed to handle notification event: ${error.message}`, error.stack);
    }
  }
}
