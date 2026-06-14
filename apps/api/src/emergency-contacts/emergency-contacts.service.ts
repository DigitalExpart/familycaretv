import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class EmergencyContactsService {
  constructor(private prisma: PrismaService, private patientsService: PatientsService) {}
  async create(userId: string, dto: CreateEmergencyContactDto) {
    await this.patientsService.verifyOwnership(dto.patientId, userId);
    return this.prisma.emergencyContact.create({ data: dto });
  }
  async findAll(userId: string, patientId: string) {
    await this.patientsService.verifyOwnership(patientId, userId);
    return this.prisma.emergencyContact.findMany({ where: { patientId } });
  }
  async findOne(id: string, userId: string) {
    const contact = await this.prisma.emergencyContact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');
    await this.patientsService.verifyOwnership(contact.patientId, userId);
    return contact;
  }
  async update(id: string, userId: string, dto: UpdateEmergencyContactDto) {
    const contact = await this.findOne(id, userId);
    return this.prisma.emergencyContact.update({ where: { id: contact.id }, data: dto });
  }
  async remove(id: string, userId: string) {
    const contact = await this.findOne(id, userId);
    return this.prisma.emergencyContact.delete({ where: { id: contact.id } });
  }
}
