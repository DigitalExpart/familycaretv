import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { Notification } from '@prisma/client';

@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);
  private expo: Expo;

  constructor(private readonly prisma: PrismaService) {
    this.expo = new Expo();
  }

  async sendPushNotification(notification: Notification) {
    this.logger.log(`[PUSH_SEND] === Sending push for notification ${notification.id} ===`);
    this.logger.log(`[PUSH_SEND] User: ${notification.userId}`);
    this.logger.log(`[PUSH_SEND] Title: ${notification.title}`);
    this.logger.log(`[PUSH_SEND] Message: ${notification.message}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: notification.userId },
        select: { expoPushTokens: true }
      });

      this.logger.log(`[PUSH_SEND] User lookup result: ${user ? 'found' : 'NOT FOUND'}`);
      this.logger.log(`[PUSH_SEND] Stored tokens: ${JSON.stringify(user?.expoPushTokens || [])}`);

      if (!user || !user.expoPushTokens || user.expoPushTokens.length === 0) {
        this.logger.warn(`[PUSH_SEND] ⚠️ No push tokens found for user ${notification.userId} - push NOT sent`);
        return;
      }

      const messages: ExpoPushMessage[] = [];
      for (const pushToken of user.expoPushTokens) {
        const isValid = Expo.isExpoPushToken(pushToken);
        this.logger.log(`[PUSH_SEND] Token: ${pushToken} | Valid: ${isValid}`);

        if (!isValid) {
          this.logger.error(`[PUSH_SEND] ❌ Invalid Expo push token: ${pushToken}`);
          continue;
        }

        const msg: ExpoPushMessage = {
          to: pushToken,
          sound: 'default',
          body: notification.message,
          title: notification.title,
          data: { actionUrl: notification.actionUrl, notificationId: notification.id },
        };
        messages.push(msg);
        this.logger.log(`[PUSH_SEND] Queued message: ${JSON.stringify(msg)}`);
      }

      if (messages.length === 0) {
        this.logger.warn(`[PUSH_SEND] ⚠️ No valid messages to send after token validation`);
        return;
      }

      const chunks = this.expo.chunkPushNotifications(messages);
      this.logger.log(`[PUSH_SEND] Sending ${messages.length} message(s) in ${chunks.length} chunk(s)`);

      const allTickets: ExpoPushTicket[] = [];
      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          this.logger.log(`[PUSH_SEND] ✅ Expo API Response: ${JSON.stringify(ticketChunk)}`);
          allTickets.push(...ticketChunk);

          // Log individual ticket results
          ticketChunk.forEach((ticket, idx) => {
            if (ticket.status === 'ok') {
              this.logger.log(`[PUSH_SEND] Ticket ${idx}: OK - ID: ${(ticket as any).id}`);
            } else {
              this.logger.error(`[PUSH_SEND] Ticket ${idx}: ERROR - ${JSON.stringify(ticket)}`);
            }
          });
        } catch (error: any) {
          this.logger.error(`[PUSH_SEND] ❌ Expo API Error: ${error.message}`, error.stack);
        }
      }

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT' }
      });
      this.logger.log(`[PUSH_SEND] Notification ${notification.id} status updated to SENT`);
      
    } catch (error: any) {
      this.logger.error(`[PUSH_SEND] ❌ Failed to send push notification: ${error.message}`, error.stack);
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED' }
      });
    }
  }

  /**
   * Sends a direct test push to a user without going through the notification/event system.
   * Used by the /notifications/test-device debug endpoint.
   */
  async sendDirectTestPush(userId: string): Promise<{
    storedTokens: string[];
    validTokens: string[];
    expoRequest: any;
    expoResponse: any;
    ticketIds: string[];
    errors: string[];
  }> {
    const result = {
      storedTokens: [] as string[],
      validTokens: [] as string[],
      expoRequest: null as any,
      expoResponse: null as any,
      ticketIds: [] as string[],
      errors: [] as string[],
    };

    this.logger.log(`[TEST_PUSH] === Direct Test Push for user ${userId} ===`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { expoPushTokens: true, firstName: true }
      });

      if (!user) {
        const err = `User ${userId} not found in database`;
        this.logger.error(`[TEST_PUSH] ❌ ${err}`);
        result.errors.push(err);
        return result;
      }

      result.storedTokens = user.expoPushTokens || [];
      this.logger.log(`[TEST_PUSH] Stored tokens: ${JSON.stringify(result.storedTokens)}`);

      if (result.storedTokens.length === 0) {
        const err = 'No Expo push tokens stored for this user';
        this.logger.warn(`[TEST_PUSH] ⚠️ ${err}`);
        result.errors.push(err);
        return result;
      }

      const messages: ExpoPushMessage[] = [];
      for (const token of result.storedTokens) {
        if (Expo.isExpoPushToken(token)) {
          result.validTokens.push(token);
          messages.push({
            to: token,
            sound: 'default',
            title: '🔔 Push Test',
            body: `Hello ${user.firstName || 'User'}! This is a direct test push from FamilyCare.`,
            data: { type: 'TEST_PUSH', timestamp: new Date().toISOString() },
          });
        } else {
          const err = `Invalid token skipped: ${token}`;
          this.logger.error(`[TEST_PUSH] ❌ ${err}`);
          result.errors.push(err);
        }
      }

      if (messages.length === 0) {
        const err = 'No valid Expo push tokens after validation';
        this.logger.error(`[TEST_PUSH] ❌ ${err}`);
        result.errors.push(err);
        return result;
      }

      result.expoRequest = messages;
      this.logger.log(`[TEST_PUSH] Sending ${messages.length} message(s) to Expo...`);
      this.logger.log(`[TEST_PUSH] Request payload: ${JSON.stringify(messages)}`);

      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          const tickets = await this.expo.sendPushNotificationsAsync(chunk);
          result.expoResponse = tickets;
          this.logger.log(`[TEST_PUSH] ✅ Expo Response: ${JSON.stringify(tickets)}`);

          tickets.forEach((ticket, idx) => {
            if (ticket.status === 'ok') {
              const ticketId = (ticket as any).id;
              result.ticketIds.push(ticketId);
              this.logger.log(`[TEST_PUSH] Ticket ${idx}: OK - ID: ${ticketId}`);
            } else {
              const errDetail = JSON.stringify(ticket);
              result.errors.push(`Ticket ${idx} error: ${errDetail}`);
              this.logger.error(`[TEST_PUSH] Ticket ${idx}: ERROR - ${errDetail}`);
            }
          });
        } catch (error: any) {
          const errMsg = `Expo API call failed: ${error.message}`;
          this.logger.error(`[TEST_PUSH] ❌ ${errMsg}`, error.stack);
          result.errors.push(errMsg);
        }
      }
    } catch (error: any) {
      const errMsg = `Unexpected error: ${error.message}`;
      this.logger.error(`[TEST_PUSH] ❌ ${errMsg}`, error.stack);
      result.errors.push(errMsg);
    }

    this.logger.log(`[TEST_PUSH] === Result: ${JSON.stringify(result)} ===`);
    return result;
  }
}

