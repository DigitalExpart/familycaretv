import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CalendarAggregatorService {
  constructor(private prisma: PrismaService) {}

  async getCalendarEvents(userId: string, startDate: Date, endDate: Date) {
    // 1. Fetch dynamic items from various tables to build calendar
    // 2. Fetch specific Reminders
    const reminders = await this.prisma.reminder.findMany({
      where: {
        userId,
        scheduledAt: { gte: startDate, lte: endDate }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    // We can merge dynamic occurrences and Reminders
    return reminders.map(r => ({
      type: r.type,
      title: r.title,
      time: r.scheduledAt.toISOString(), // formatting logic later
      sourceId: r.sourceId,
      status: r.status,
    }));
  }
}
