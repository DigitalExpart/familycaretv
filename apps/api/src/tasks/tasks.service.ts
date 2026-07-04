import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private remindersService: RemindersService) {}

  async create(userId: string, data: any) {
    const task = await this.prisma.task.create({
      data: { ...data, userId },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
    if (task.time) {
      if (task.isDaily || (task.daysOfWeek && task.daysOfWeek.length > 0)) {
        await this.remindersService.syncRecurringReminders(
          userId,
          'TASK',
          task.id,
          'TASK',
          `Task: ${task.title}`,
          `Reminder: ${task.title}`,
          task.isDaily ? ['Everyday'] : task.daysOfWeek,
          [task.time],
          user?.timezone || 'UTC'
        );
      } else if (task.date) {
        // One-off
        const match = task.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
           let hours = parseInt(match[1], 10);
           const minutes = parseInt(match[2], 10);
           const ampm = match[3]?.toUpperCase();
           if (ampm === 'PM' && hours < 12) hours += 12;
           if (ampm === 'AM' && hours === 12) hours = 0;
           
           const scheduledAt = new Date(task.date);
           scheduledAt.setUTCHours(hours, minutes, 0, 0);
           
           await this.remindersService.createReminder({
             userId, type: 'TASK', title: `Task: ${task.title}`, message: `Reminder: ${task.title}`,
             scheduledAt, sourceType: 'TASK', sourceId: task.id
           });
        }
      }
    }
    return task;
  }

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAllToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today.getDay()];

    return this.prisma.task.findMany({
      where: {
        userId,
        OR: [
          {
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
          {
            isDaily: true,
          },
          {
            daysOfWeek: { hasSome: [todayName, 'Everyday', 'everyday', 'Daily', 'daily'] }
          }
        ]
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, userId: string, data: any) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== userId) throw new NotFoundException('Task not found');
    const updated = await this.prisma.task.update({ where: { id }, data });

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
    if (updated.time) {
      await this.remindersService.cancelReminderBySource('TASK', updated.id);
      if (updated.isDaily || (updated.daysOfWeek && updated.daysOfWeek.length > 0)) {
        await this.remindersService.syncRecurringReminders(
          userId,
          'TASK',
          updated.id,
          'TASK',
          `Task: ${updated.title}`,
          `Reminder: ${updated.title}`,
          updated.isDaily ? ['Everyday'] : updated.daysOfWeek,
          [updated.time],
          user?.timezone || 'UTC'
        );
      } else if (updated.date) {
        // One-off
        const match = updated.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
           let hours = parseInt(match[1], 10);
           const minutes = parseInt(match[2], 10);
           const ampm = match[3]?.toUpperCase();
           if (ampm === 'PM' && hours < 12) hours += 12;
           if (ampm === 'AM' && hours === 12) hours = 0;
           
           const scheduledAt = new Date(updated.date);
           scheduledAt.setUTCHours(hours, minutes, 0, 0);
           
           await this.remindersService.createReminder({
             userId, type: 'TASK', title: `Task: ${updated.title}`, message: `Reminder: ${updated.title}`,
             scheduledAt, sourceType: 'TASK', sourceId: updated.id
           });
        }
      }
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== userId) throw new NotFoundException('Task not found');
    await this.remindersService.cancelReminderBySource('TASK', id);
    return this.prisma.task.delete({ where: { id } });
  }

  async createJournal(userId: string, content: string, date: Date) {
    return this.prisma.dailyJournal.create({
      data: { userId, content, date },
    });
  }

  async getJournalToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.dailyJournal.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }
}
