import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { Notification } from '@prisma/client';

@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);
  private expo: Expo;

  constructor(private readonly prisma: PrismaService) {
    this.expo = new Expo();
  }

  async sendPushNotification(notification: Notification) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: notification.userId },
        select: { expoPushTokens: true }
      });

      if (!user || !user.expoPushTokens || user.expoPushTokens.length === 0) {
        this.logger.log(`No push tokens found for user ${notification.userId}`);
        // We leave the status as PENDING or maybe update to UNREAD to denote it's in the DB but no push sent.
        // For now, let's keep it PENDING, or we can use a new status like DELIVERED_SILENTLY.
        return;
      }

      const messages: ExpoPushMessage[] = [];
      for (let pushToken of user.expoPushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
          this.logger.error(`Push token ${pushToken} is not a valid Expo push token`);
          continue;
        }

        messages.push({
          to: pushToken,
          sound: 'default',
          body: notification.message,
          title: notification.title,
          data: { actionUrl: notification.actionUrl, notificationId: notification.id },
        });
      }

      if (messages.length === 0) return;

      const chunks = this.expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          this.logger.log(`Sent push notification chunk:`, ticketChunk);
        } catch (error) {
          this.logger.error(`Error sending push notification chunk`, error);
        }
      }

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT' }
      });
      
    } catch (error: any) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED' }
      });
    }
  }
}
