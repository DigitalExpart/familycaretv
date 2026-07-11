import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CalendarAggregatorService {
  constructor(private prisma: PrismaService) {}

  async getCalendarEvents(userId: string, startDate: Date, endDate: Date) {
    // 1. Find all patients for this user
    const patients = await this.prisma.patient.findMany({
      where: { userId }
    });
    const patientIds = patients.map(p => p.id);

    // 2. Fetch Events for these patients within the date range
    const events = await this.prisma.event.findMany({
      where: {
        patientId: { in: patientIds },
        startDateTime: { gte: startDate, lte: endDate }
      }
    });

    // 3. Fetch specific Reminders (except ones for Events, to avoid duplicates)
    const reminders = await this.prisma.reminder.findMany({
      where: {
        userId,
        scheduledAt: { gte: startDate, lte: endDate },
        sourceType: { not: 'EVENT' }
      }
    });

    // Combine and sort
    const calendarItems = [
      ...events.map(e => ({
        id: e.id,
        type: e.type, // APPOINTMENT, MEDICATION, TASK
        title: e.title,
        startDateTime: e.startDateTime.toISOString(),
        sourceId: e.id,
        status: e.status,
      })),
      ...reminders.map(r => ({
        id: r.id,
        type: r.type,
        title: r.title,
        startDateTime: r.scheduledAt.toISOString(),
        sourceId: r.sourceId,
        status: r.status,
      }))
    ];

    calendarItems.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

    return calendarItems;
  }
}
