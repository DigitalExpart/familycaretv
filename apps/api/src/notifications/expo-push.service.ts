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

  private readonly debugState = new Map<string, any>();

  getDebugState(userId: string) {
    return this.debugState.get(userId) || {
      userId,
      storedToken: null,
      hasToken: false,
      lastPushSentAt: null,
      lastExpoTicket: null,
      lastReceipt: null,
      lastError: null
    };
  }

  async sendPushNotification(notification: Notification) {
    const userId = notification.userId;
    const debug = this.getDebugState(userId);
    debug.lastPushSentAt = new Date().toISOString();
    this.debugState.set(userId, debug);

    this.logger.log(`[PUSH_SEND] === Sending push for notification ${notification.id} ===`);
    this.logger.log(`[PUSH_SEND] User: ${userId}`);
    this.logger.log(`[PUSH_SEND] Title: ${notification.title}`);
    this.logger.log(`[PUSH_SEND] Message: ${notification.message}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { expoPushTokens: true }
      });

      this.logger.log(`[PUSH_SEND] User lookup result: ${user ? 'found' : 'NOT FOUND'}`);
      this.logger.log(`[PUSH_SEND] Stored tokens: ${JSON.stringify(user?.expoPushTokens || [])}`);

      debug.storedToken = user?.expoPushTokens?.[0] || null;
      debug.hasToken = !!debug.storedToken;

      if (!user || !user.expoPushTokens || user.expoPushTokens.length === 0) {
        this.logger.warn(`[PUSH_SEND] ⚠️ No push tokens found for user ${userId} - push NOT sent`);
        debug.lastError = 'No push tokens found';
        return;
      }

      const messages: ExpoPushMessage[] = [];
      const invalidTokens: string[] = [];
      for (const pushToken of user.expoPushTokens) {
        const isValid = Expo.isExpoPushToken(pushToken);
        this.logger.log(`[PUSH_SEND] Token: ${pushToken} | Valid: ${isValid}`);

        if (!isValid) {
          this.logger.error(`[PUSH_SEND] ❌ Invalid Expo push token: ${pushToken}`);
          invalidTokens.push(pushToken);
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
        this.logger.log(`[PUSH_SEND] Queued message payload: ${JSON.stringify(msg)}`);
      }

      if (invalidTokens.length > 0) {
         this.logger.log(`[PUSH_SEND] Rejected tokens: ${JSON.stringify(invalidTokens)}`);
      }

      if (messages.length === 0) {
        this.logger.warn(`[PUSH_SEND] ⚠️ No valid messages to send after token validation`);
        debug.lastError = 'No valid tokens';
        return;
      }

      const chunks = this.expo.chunkPushNotifications(messages);
      this.logger.log(`[PUSH_SEND] Sending ${messages.length} message(s) in ${chunks.length} chunk(s)`);

      const allTickets: ExpoPushTicket[] = [];
      const staleTokens: string[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          this.logger.log(`[PUSH_SEND] ✅ Expo API Response (Tickets): ${JSON.stringify(ticketChunk)}`);
          allTickets.push(...ticketChunk);

          // Log individual ticket results and fetch receipts immediately for debug
          const ticketIds: string[] = [];
          const ticketIdToTokenMap = new Map<string, string>();

          ticketChunk.forEach((ticket, idx) => {
            const pushToken = chunk[idx].to;
            if (typeof pushToken !== 'string') return;

            if (ticket.status === 'ok') {
              const tid = (ticket as any).id;
              this.logger.log(`[PUSH_SEND] Ticket ${idx}: OK - ID: ${tid}`);
              ticketIds.push(tid);
              ticketIdToTokenMap.set(tid, pushToken);
              debug.lastExpoTicket = tid;
            } else {
              this.logger.error(`[PUSH_SEND] Ticket ${idx}: ERROR - ${JSON.stringify(ticket)}`);
              debug.lastError = JSON.stringify(ticket);
              
              if (ticket.details?.error === 'DeviceNotRegistered') {
                this.logger.warn(`[PUSH_SEND] ⚠️ Token ${pushToken} is no longer registered. Marking for removal.`);
                staleTokens.push(pushToken);
              }
            }
          });

          if (ticketIds.length > 0) {
            // STEP 6: Query Receipt immediately
            this.logger.log(`[PUSH_SEND] Querying receipts for ticket IDs: ${ticketIds.join(', ')}`);
            try {
              // Wait 1 second before querying receipt so Expo has time to process it
              await new Promise(res => setTimeout(res, 1000));
              const receiptChunks = this.expo.chunkPushNotificationReceiptIds(ticketIds);
              for (const rc of receiptChunks) {
                const receipts = await this.expo.getPushNotificationReceiptsAsync(rc);
                this.logger.log(`[PUSH_SEND] 🧾 Receipts Result: ${JSON.stringify(receipts)}`);
                debug.lastReceipt = JSON.stringify(receipts);
                
                // Detailed receipt error logging
                for (let receiptId in receipts) {
                  let receipt = receipts[receiptId];
                  const associatedToken = ticketIdToTokenMap.get(receiptId);

                  if (receipt.status === 'ok') {
                    this.logger.log(`[PUSH_SEND] Receipt ${receiptId}: DELIVERED SUCCESSFULLY`);
                  } else if (receipt.status === 'error') {
                    this.logger.error(`[PUSH_SEND] Receipt ${receiptId}: DELIVERY ERROR - ${receipt.message} (${receipt.details?.error})`);
                    debug.lastError = `Receipt Error: ${receipt.details?.error}`;
                    
                    if (receipt.details?.error === 'DeviceNotRegistered' && associatedToken) {
                       this.logger.warn(`[PUSH_SEND] ⚠️ Receipt indicates token ${associatedToken} is unregistered. Marking for removal.`);
                       staleTokens.push(associatedToken);
                    }
                  }
                }
              }
            } catch (receiptErr: any) {
              this.logger.error(`[PUSH_SEND] Failed to fetch receipts: ${receiptErr.message}`);
            }
          }
        } catch (error: any) {
          this.logger.error(`[PUSH_SEND] ❌ Expo API Error: ${error.message}`, error.stack);
          debug.lastError = `Expo API Error: ${error.message}`;
        }
      }

      // Cleanup stale tokens from DB
      if (staleTokens.length > 0 || invalidTokens.length > 0) {
        const tokensToRemove = [...new Set([...staleTokens, ...invalidTokens])];
        this.logger.log(`[PUSH_SEND] Cleaning up ${tokensToRemove.length} stale/invalid tokens from user ${userId}`);
        const updatedTokens = user.expoPushTokens.filter(t => !tokensToRemove.includes(t));
        
        await this.prisma.user.update({
          where: { id: userId },
          data: { expoPushTokens: updatedTokens }
        });
        this.logger.log(`[PUSH_SEND] Database updated. Remaining tokens: ${updatedTokens.length}`);
      }

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT' }
      });
      this.logger.log(`[PUSH_SEND] Notification ${notification.id} status updated to SENT`);
      
    } catch (error: any) {
      this.logger.error(`[PUSH_SEND] ❌ Failed to send push notification: ${error.message}`, error.stack);
      debug.lastError = `Unexpected Error: ${error.message}`;
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

