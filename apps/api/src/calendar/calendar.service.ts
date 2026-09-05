import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CalendarAggregatorService {
  constructor(private prisma: PrismaService) {}

  async getCalendarEvents(userId: string, startDate?: Date, endDate?: Date) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setUTCHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    end.setUTCHours(23, 59, 59, 999);

    // 1. Find all patients for this user
    const patients = await this.prisma.patient.findMany({
      where: { userId }
    });
    const patientIds = patients.map(p => p.id);

    // 2. Fetch Events for these patients within the date range
    const events = await this.prisma.event.findMany({
      where: {
        patientId: { in: patientIds },
        startDateTime: { gte: start, lte: end }
      }
    });

    // 3. Fetch specific Reminders (except ones for Events, to avoid duplicates)
    const reminders = await this.prisma.reminder.findMany({
      where: {
        userId,
        scheduledAt: { gte: start, lte: end },
        sourceType: { not: 'EVENT' }
      }
    });

    // 4. Fetch Tasks for this user
    const tasks = await this.prisma.task.findMany({
      where: { userId }
    });

    // Track existing task dates from reminders so we don't duplicate
    const existingTaskSlots = new Set<string>();
    for (const r of reminders) {
      if (r.sourceType === 'TASK' && r.sourceId) {
        const dStr = r.scheduledAt.toISOString().slice(0, 10);
        existingTaskSlots.add(`${r.sourceId}_${dStr}`);
      }
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const projectedTaskItems: any[] = [];

    // Helper to parse "HH:MM AM/PM" or "HH:MM"
    const parseTime = (timeStr?: string | null) => {
      let hours = 9;
      let minutes = 0;
      if (timeStr) {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          const ampm = match[3]?.toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
      }
      return { hours, minutes };
    };

    for (const task of tasks) {
      const { hours, minutes } = parseTime(task.time);

      if (task.isDaily || (task.daysOfWeek && task.daysOfWeek.length > 0)) {
        // Project onto each matching day in the query range
        const cursor = new Date(start);
        while (cursor <= end) {
          const dayName = dayNames[cursor.getUTCDay()];
          const isMatch = task.isDaily || task.daysOfWeek.some(d =>
            d.toLowerCase() === dayName.toLowerCase() ||
            d.toLowerCase() === 'everyday' ||
            d.toLowerCase() === 'daily'
          );

          if (isMatch) {
            const dateStr = cursor.toISOString().slice(0, 10);
            const slotKey = `${task.id}_${dateStr}`;
            if (!existingTaskSlots.has(slotKey)) {
              existingTaskSlots.add(slotKey);
              const itemDate = new Date(cursor);
              itemDate.setUTCHours(hours, minutes, 0, 0);
              projectedTaskItems.push({
                id: `${task.id}-${dateStr}`,
                type: 'TASK',
                title: task.title,
                startDateTime: itemDate.toISOString(),
                sourceId: task.id,
                status: task.completed ? 'COMPLETED' : 'ACTIVE',
                category: task.category,
              });
            }
          }
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
      } else if (task.date) {
        const taskDate = new Date(task.date);
        if (taskDate >= start && taskDate <= end) {
          const dateStr = taskDate.toISOString().slice(0, 10);
          const slotKey = `${task.id}_${dateStr}`;
          if (!existingTaskSlots.has(slotKey)) {
            existingTaskSlots.add(slotKey);
            taskDate.setUTCHours(hours, minutes, 0, 0);
            projectedTaskItems.push({
              id: task.id,
              type: 'TASK',
              title: task.title,
              startDateTime: taskDate.toISOString(),
              sourceId: task.id,
              status: task.completed ? 'COMPLETED' : 'ACTIVE',
              category: task.category,
            });
          }
        }
      }
    }

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
      })),
      ...projectedTaskItems,
    ];

    calendarItems.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

    return calendarItems;
  }
}

