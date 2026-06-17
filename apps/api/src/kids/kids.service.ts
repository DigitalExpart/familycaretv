import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class KidsService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, data: any) {
    const { notes, ...rest } = data;
    return this.prisma.childProfile.create({
      data: {
        ...rest,
        userId,
        ...(notes?.length ? { notes: { create: notes } } : {}),
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
    await this.getProfile(childId, userId);
    return this.prisma.childTask.create({ data: { ...data, childId } });
  }

  async updateTask(taskId: string, childId: string, userId: string, data: any) {
    await this.getProfile(childId, userId);
    return this.prisma.childTask.update({ where: { id: taskId }, data });
  }

  // --- Events ---
  async addEvent(childId: string, userId: string, data: any) {
    await this.getProfile(childId, userId);
    return this.prisma.childCalendarEvent.create({ data: { ...data, childId } });
  }

  // --- Notes ---
  async addNote(childId: string, userId: string, data: any) {
    await this.getProfile(childId, userId);
    return this.prisma.childNote.create({ data: { ...data, childId } });
  }
}
