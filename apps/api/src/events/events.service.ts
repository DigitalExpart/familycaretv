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
}
