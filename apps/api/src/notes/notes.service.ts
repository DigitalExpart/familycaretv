import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService, private patientsService: PatientsService) {}
  async create(userId: string, dto: CreateNoteDto) {
    await this.patientsService.verifyOwnership(dto.patientId, userId);
    return this.prisma.patientNote.create({ data: dto });
  }
  async findAll(userId: string, patientId: string) {
    await this.patientsService.verifyOwnership(patientId, userId);
    return this.prisma.patientNote.findMany({ where: { patientId } });
  }
  async findOne(id: string, userId: string) {
    const note = await this.prisma.patientNote.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    await this.patientsService.verifyOwnership(note.patientId, userId);
    return note;
  }
  async update(id: string, userId: string, dto: UpdateNoteDto) {
    const note = await this.findOne(id, userId);
    return this.prisma.patientNote.update({ where: { id: note.id }, data: dto });
  }
  async remove(id: string, userId: string) {
    const note = await this.findOne(id, userId);
    return this.prisma.patientNote.delete({ where: { id: note.id } });
  }
}
