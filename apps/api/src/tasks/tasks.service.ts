import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.task.create({
      data: {
        ...data,
        userId,
      },
    });
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
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== userId) throw new NotFoundException('Task not found');
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
