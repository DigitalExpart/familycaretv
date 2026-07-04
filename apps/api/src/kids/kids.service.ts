import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import { fromZonedTime } from 'date-fns-tz';

@Injectable()
export class KidsService {
  constructor(private prisma: PrismaService, private remindersService: RemindersService) {}

  async createProfile(userId: string, data: any) {
    const { notes, tasks, ...rest } = data;
    return this.prisma.childProfile.create({
      data: {
        ...rest,
        userId,
        ...(notes?.length ? { notes: { create: notes } } : {}),
        ...(tasks?.length ? { tasks: { create: tasks } } : {}),
      },
    });
  }

  async findAllProfiles(userId: string) {
    return this.prisma.childProfile.findMany({
      where: { userId },
      include: {
        tasks: true,
        events: true,
        notes: true,
      },
    });
  }

  async getProfile(id: string, userId: string) {
    const profile = await this.prisma.childProfile.findUnique({
      where: { id },
      include: { tasks: true, events: true, notes: true },
    });
    if (!profile || profile.userId !== userId) throw new NotFoundException('Child profile not found');
    return profile;
  }

  async updateProfile(id: string, userId: string, data: any) {
    await this.getProfile(id, userId); // Verify ownership
    const { notes, ...rest } = data;
    return this.prisma.childProfile.update({ 
      where: { id }, 
      data: {
        ...rest,
        ...(notes !== undefined ? { notes: { deleteMany: {}, create: notes } } : {}),
      } 
    });
  }

  async removeProfile(id: string, userId: string) {
    await this.getProfile(id, userId);
    return this.prisma.childProfile.delete({ where: { id } });
  }

  // --- Tasks ---
  async addTask(childId: string, userId: string, data: any) {
    const profile = await this.getProfile(childId, userId);
    const task = await this.prisma.childTask.create({ data: { ...data, childId } });
    
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
    const tz = user?.timezone || 'UTC';
    
    if (task.time) {
      if (task.isDaily || (task.daysOfWeek && task.daysOfWeek.length > 0)) {
        await this.remindersService.syncRecurringReminders(
          userId, 'KIDS_TASK', task.id, 'KIDS_TASK',
          `Kid's Task: ${task.title}`, `It is time for ${profile.name} to do: ${task.title}`,
          task.isDaily ? ['Everyday'] : task.daysOfWeek, [task.time], tz
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
           
           const dateString = task.date.toISOString().split('T')[0];
           const localTimeString = `${dateString} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
           const scheduledAt = fromZonedTime(localTimeString, tz);
           
           await this.remindersService.createReminder({
             userId, type: 'KIDS_TASK', title: `Kid's Task: ${task.title}`, message: `${profile.name} needs to: ${task.title}`,
             scheduledAt, sourceType: 'KIDS_TASK', sourceId: task.id
           });
        }
      }
    }
    
    return task;
  }

  async updateTask(taskId: string, childId: string, userId: string, data: any) {
    const profile = await this.getProfile(childId, userId);
    const task = await this.prisma.childTask.update({ where: { id: taskId }, data });
    
    await this.remindersService.cancelReminderBySource('KIDS_TASK', taskId);
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
    const tz = user?.timezone || 'UTC';

    if (task.time) {
      if (task.isDaily || (task.daysOfWeek && task.daysOfWeek.length > 0)) {
        await this.remindersService.syncRecurringReminders(
          userId, 'KIDS_TASK', task.id, 'KIDS_TASK',
          `Kid's Task: ${task.title}`, `It is time for ${profile.name} to do: ${task.title}`,
          task.isDaily ? ['Everyday'] : task.daysOfWeek, [task.time], tz
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
           
           const dateString = task.date.toISOString().split('T')[0];
           const localTimeString = `${dateString} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
           const scheduledAt = fromZonedTime(localTimeString, tz);
           
           await this.remindersService.createReminder({
             userId, type: 'KIDS_TASK', title: `Kid's Task: ${task.title}`, message: `${profile.name} needs to: ${task.title}`,
             scheduledAt, sourceType: 'KIDS_TASK', sourceId: task.id
           });
        }
      }
    }
    
    return task;
  }

  async removeTask(taskId: string, childId: string, userId: string) {
    await this.getProfile(childId, userId);
    await this.remindersService.cancelReminderBySource('KIDS_TASK', taskId);
    return this.prisma.childTask.delete({ where: { id: taskId } });
  }

  // --- Events ---
  async addEvent(childId: string, userId: string, data: any) {
    const profile = await this.getProfile(childId, userId);
    const event = await this.prisma.childCalendarEvent.create({ data: { ...data, childId } });
    
    await this.remindersService.createReminder({
        userId, type: 'EVENT', title: `Kid's Event: ${event.title}`, message: `${profile.name} has an event: ${event.title}`,
        scheduledAt: event.date, sourceType: 'KIDS_EVENT', sourceId: event.id
    });
      
    return event;
  }

  // --- Notes ---
  async addNote(childId: string, userId: string, data: any) {
    await this.getProfile(childId, userId);
    return this.prisma.childNote.create({ data: { ...data, childId } });
  }
}
