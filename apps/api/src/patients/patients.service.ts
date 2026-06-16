import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.patient.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, userId },
      include: {
        doctors: true,
        medications: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
          }
        },
        events: true,
        patientNotes: true,
        contacts: true,
      }
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async update(id: string, userId: string, dto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findFirst({ where: { id, userId } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.patient.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const patient = await this.prisma.patient.findFirst({ where: { id, userId } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.patient.delete({
      where: { id },
    });
  }

  async adminUpdate(id: string, dto: UpdatePatientDto) {
    return this.prisma.patient.update({
      where: { id },
      data: dto,
    });
  }

  async adminRemove(id: string) {
    return this.prisma.patient.delete({
      where: { id },
    });
  }

  async verifyOwnership(id: string, userId: string) {
    const patient = await this.prisma.patient.findFirst({ where: { id, userId } });
    if (!patient) {
      throw new NotFoundException('Patient not found or unauthorized');
    }
    return patient;
  }
}
