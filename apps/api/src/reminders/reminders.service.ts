import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { addDays } from 'date-fns';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(private prisma: PrismaService) {}

  async createReminder(data: {
    userId: string;
    type: string;
    title: string;
    message?: string;
    scheduledAt: Date;
    sourceType?: string;
    sourceId?: string;
  }) {
    try {
      return await this.prisma.reminder.create({
        data: {
          ...data,
          status: 'PENDING',
        }
      });
    } catch (e) {
      this.logger.error('Failed to create reminder', e);
      return null;
    }
  }

  async cancelReminderBySource(sourceType: string, sourceId: string) {
    return this.prisma.reminder.deleteMany({
      where: { sourceType, sourceId, status: 'PENDING' }
    });
  }

  // Generate instances for a recurring schedule for the next X days
  async syncRecurringReminders(
    userId: string,
    sourceType: string,
    sourceId: string,
    type: string,
    title: string,
    message: string,
    daysOfWeek: string[],
    timesOfDay: string[], // "HH:MM AM/PM"
    timezone: string = 'UTC',
    daysToGenerate: number = 14
  ) {
    // 1. Clear existing pending reminders
    await this.cancelReminderBySource(sourceType, sourceId);

    // 2. Generate new reminders
    const remindersToCreate: any[] = [];
    const nowUtc = new Date();

    for (let i = 0; i < daysToGenerate; i++) {
      const targetDate = addDays(nowUtc, i);
      
      const dayName = formatInTimeZone(targetDate, timezone, 'EEEE');
      const isRightDay = daysOfWeek.some(d => 
        d.toLowerCase() === dayName.toLowerCase() || 
        d.toLowerCase() === 'everyday' || 
        d.toLowerCase() === 'daily'
      );

      if (!isRightDay) continue;

      for (const timeStr of timesOfDay) {
        const { hours, minutes } = this.parseTimeStr(timeStr);
        
        // Format the target date (YYYY-MM-DD) in the target timezone
        const dateString = formatInTimeZone(targetDate, timezone, 'yyyy-MM-dd');
        
        // Create an ISO string representing the exact local time in the target timezone
        const localTimeString = `${dateString} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        
        // Convert that local time back into a true UTC Date object using date-fns-tz
        const scheduledAt = fromZonedTime(localTimeString, timezone);

        if (scheduledAt >= new Date(nowUtc.getTime() - 5 * 60000)) {
          remindersToCreate.push({
            userId,
            type,
            title,
            message,
            scheduledAt,
            sourceType,
            sourceId,
            status: 'PENDING'
          });
        }
      }
    }

    if (remindersToCreate.length > 0) {
      await this.prisma.reminder.createMany({ data: remindersToCreate });
    }
  }

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
}
