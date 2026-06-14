import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class DoctorsService {
  constructor(
    private prisma: PrismaService,
    private patientsService: PatientsService,
  ) {}

  async create(userId: string, dto: CreateDoctorDto) {
    await this.patientsService.verifyOwnership(dto.patientId, userId);
    return this.prisma.doctor.create({ data: dto });
  }

  async findAll(userId: string, patientId: string) {
    await this.patientsService.verifyOwnership(patientId, userId);
    return this.prisma.doctor.findMany({ where: { patientId } });
  }

  async findOne(id: string, userId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    await this.patientsService.verifyOwnership(doctor.patientId, userId);
    return doctor;
  }

  async update(id: string, userId: string, dto: UpdateDoctorDto) {
    const doctor = await this.findOne(id, userId);
    return this.prisma.doctor.update({ where: { id: doctor.id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const doctor = await this.findOne(id, userId);
    return this.prisma.doctor.delete({ where: { id: doctor.id } });
  }
}
