import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService, private patientsService: PatientsService) {}

  async create(userId: string, dto: CreateEventDto) {
    await this.patientsService.verifyOwnership(dto.patientId, userId);
    return this.prisma.event.create({ data: dto });
  }

  async findAll(userId: string, patientId: string) {
    await this.patientsService.verifyOwnership(patientId, userId);
    return this.prisma.event.findMany({ where: { patientId } });
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.patientsService.verifyOwnership(event.patientId, userId);
    return event;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.findOne(id, userId);
    return this.prisma.event.update({ where: { id: event.id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const event = await this.findOne(id, userId);
    return this.prisma.event.delete({ where: { id: event.id } });
  }

  async getToday(userId: string, patientId?: string) {
    let targetPatientIds: string[] = [];
    if (patientId) {
      await this.patientsService.verifyOwnership(patientId, userId);
      targetPatientIds.push(patientId);
    } else {
      const patients = await this.prisma.patient.findMany({ where: { userId } });
      targetPatientIds = patients.map(p => p.id);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return this.prisma.event.findMany({
      where: {
        patientId: { in: targetPatientIds },
        startDateTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { startDateTime: 'asc' },
    });
  }

  async getUpcoming(userId: string, patientId?: string) {
    let targetPatientIds: string[] = [];
    if (patientId) {
      await this.patientsService.verifyOwnership(patientId, userId);
      targetPatientIds.push(patientId);
    } else {
      const patients = await this.prisma.patient.findMany({ where: { userId } });
      targetPatientIds = patients.map(p => p.id);
    }

    const now = new Date();

    return this.prisma.event.findMany({
      where: {
        patientId: { in: targetPatientIds },
        startDateTime: { gte: now },
      },
      orderBy: { startDateTime: 'asc' },
      take: 20,
    });
  }

  async getTicker(userId: string, patientId?: string) {
    let targetPatientIds: string[] = [];
    if (patientId) {
      await this.patientsService.verifyOwnership(patientId, userId);
      targetPatientIds.push(patientId);
    } else {
      const patients = await this.prisma.patient.findMany({ where: { userId } });
      targetPatientIds = patients.map(p => p.id);
    }

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const events = await this.prisma.event.findMany({
      where: {
        patientId: { in: targetPatientIds },
        startDateTime: {
          gte: now,
          lte: tomorrow,
        },
      },
      orderBy: { startDateTime: 'asc' },
    });

    return events.map(event => {
      const timeString = event.startDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      
      let message = '';
      if (event.type === 'MEDICATION') {
        message = `Take ${event.title} at ${timeString}`;
      } else if (event.type === 'APPOINTMENT') {
        message = `${event.title} appointment at ${timeString}`;
      } else {
        message = `${event.title} at ${timeString}`;
      }

      return { message };
    });
  }
}
