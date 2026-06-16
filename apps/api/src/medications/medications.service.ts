import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class MedicationsService {
  constructor(private prisma: PrismaService, private patientsService: PatientsService) {}
  async create(userId: string, dto: CreateMedicationDto) {
    await this.patientsService.verifyOwnership(dto.patientId, userId);
    let expiresAt = undefined;
    if (dto.durationWeeks) {
      expiresAt = new Date(Date.now() + dto.durationWeeks * 7 * 24 * 60 * 60 * 1000);
    }
    return this.prisma.medication.create({ data: { ...dto, expiresAt } });
  }
  async findAll(userId: string, patientId: string) {
    await this.patientsService.verifyOwnership(patientId, userId);
    return this.prisma.medication.findMany({ 
      where: { 
        patientId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      } 
    });
  }
  async findOne(id: string, userId: string) {
    const medication = await this.prisma.medication.findUnique({ where: { id } });
    if (!medication) throw new NotFoundException('Medication not found');
    await this.patientsService.verifyOwnership(medication.patientId, userId);
    return medication;
  }
  async update(id: string, userId: string, dto: UpdateMedicationDto) {
    const medication = await this.findOne(id, userId);
    let expiresAt = medication.expiresAt;
    if (dto.durationWeeks !== undefined) {
      if (dto.durationWeeks === null) {
        expiresAt = null;
      } else {
        expiresAt = new Date(medication.createdAt.getTime() + dto.durationWeeks * 7 * 24 * 60 * 60 * 1000);
      }
    }
    return this.prisma.medication.update({ where: { id: medication.id }, data: { ...dto, expiresAt } });
  }
  async remove(id: string, userId: string) {
    const medication = await this.findOne(id, userId);
    return this.prisma.medication.delete({ where: { id: medication.id } });
  }

  async adminCreate(dto: CreateMedicationDto) {
    return this.prisma.medication.create({ data: dto });
  }

  async adminUpdate(id: string, dto: UpdateMedicationDto) {
    return this.prisma.medication.update({ where: { id }, data: dto });
  }

  async adminRemove(id: string) {
    return this.prisma.medication.delete({ where: { id } });
  }
}
