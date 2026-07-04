import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PetsService {
  private readonly logger = new Logger(PetsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Sanitize nested records by stripping fields that don't exist on the Prisma model.
   * This prevents "Unknown arg" errors when the frontend sends extra fields.
   */
  private sanitizeTaskData(tasks: any[]) {
    return tasks.map(({ title, completed, date, time, isDaily, daysOfWeek }) => ({
      title,
      completed: completed ?? false,
      ...(date !== undefined ? { date: date ? new Date(date) : null } : {}),
      ...(time !== undefined ? { time } : {}),
      ...(isDaily !== undefined ? { isDaily } : {}),
      ...(daysOfWeek !== undefined ? { daysOfWeek } : {}),
    })).filter(t => t.title); // must have a title
  }

  private sanitizeMedicationData(medications: any[]) {
    return medications.map(({ name, dosage, frequency }) => ({
      name,
      ...(dosage !== undefined ? { dosage } : {}),
      ...(frequency !== undefined ? { frequency } : {}),
    })).filter(m => m.name);
  }

  private sanitizeVaccinationData(vaccinations: any[]) {
    return vaccinations.map(({ vaccineName, dateGiven, nextDue }) => ({
      vaccineName,
      ...(dateGiven !== undefined ? { dateGiven: dateGiven ? new Date(dateGiven) : null } : {}),
      ...(nextDue !== undefined ? { nextDue: nextDue ? new Date(nextDue) : null } : {}),
    })).filter(v => v.vaccineName);
  }

  async createPet(userId: string, data: any) {
    const { veterinarians, clinics, vaccinations, medications, notes, tasks, ...rest } = data;

    // Strip unknown fields from rest (only keep known Pet columns)
    const petData: any = {};
    if (rest.name !== undefined) petData.name = rest.name;
    if (rest.breed !== undefined) petData.breed = rest.breed;
    if (rest.age !== undefined) petData.age = rest.age !== null ? Number(rest.age) || null : null;
    if (rest.weight !== undefined) petData.weight = rest.weight !== null ? Number(rest.weight) || null : null;

    try {
      return await this.prisma.pet.create({
        data: {
          ...petData,
          userId,
          ...(veterinarians?.length ? { veterinarians: { create: veterinarians.map((v: any) => ({ name: v.name, phone: v.phone })).filter((v: any) => v.name) } } : {}),
          ...(clinics?.length ? { clinics: { create: clinics.map((c: any) => ({ name: c.name, phone: c.phone })).filter((c: any) => c.name) } } : {}),
          ...(vaccinations?.length ? { vaccinations: { create: this.sanitizeVaccinationData(vaccinations) } } : {}),
          ...(medications?.length ? { medications: { create: this.sanitizeMedicationData(medications) } } : {}),
          ...(notes?.length ? { notes: { create: notes.map((n: any) => ({ content: n.content })).filter((n: any) => n.content) } } : {}),
          ...(tasks?.length ? { tasks: { create: this.sanitizeTaskData(tasks) } } : {}),
        },
        include: {
          veterinarians: true,
          clinics: true,
          vaccinations: true,
          medications: true,
          notes: true,
          tasks: true,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to create pet: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAllPets(userId: string) {
    return this.prisma.pet.findMany({
      where: { userId },
      include: {
        veterinarians: true,
        clinics: true,
        vaccinations: true,
        medications: true,
        notes: true,
        tasks: true,
      },
    });
  }

  async getPet(id: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: {
        veterinarians: true,
        clinics: true,
        vaccinations: true,
        medications: true,
        notes: true,
        tasks: true,
      },
    });
    if (!pet || pet.userId !== userId) throw new NotFoundException('Pet not found');
    return pet;
  }

  async updatePet(id: string, userId: string, data: any) {
    await this.getPet(id, userId); // verify ownership
    const { veterinarians, clinics, vaccinations, medications, notes, tasks, ...rest } = data;
    
    const petData: any = {};
    if (rest.name !== undefined) petData.name = rest.name;
    if (rest.breed !== undefined) petData.breed = rest.breed;
    if (rest.age !== undefined) petData.age = rest.age !== null ? Number(rest.age) || null : null;
    if (rest.weight !== undefined) petData.weight = rest.weight !== null ? Number(rest.weight) || null : null;

    try {
      return await this.prisma.pet.update({ 
        where: { id }, 
        data: {
          ...petData,
          ...(veterinarians !== undefined ? { veterinarians: { deleteMany: {}, ...(veterinarians.length ? { create: veterinarians.map((v: any) => ({ name: v.name, phone: v.phone })).filter((v: any) => v.name) } : {}) } } : {}),
          ...(clinics !== undefined ? { clinics: { deleteMany: {}, ...(clinics.length ? { create: clinics.map((c: any) => ({ name: c.name, phone: c.phone })).filter((c: any) => c.name) } : {}) } } : {}),
          ...(vaccinations !== undefined ? { vaccinations: { deleteMany: {}, ...(vaccinations.length ? { create: this.sanitizeVaccinationData(vaccinations) } : {}) } } : {}),
          ...(medications !== undefined ? { medications: { deleteMany: {}, ...(medications.length ? { create: this.sanitizeMedicationData(medications) } : {}) } } : {}),
          ...(notes !== undefined ? { notes: { deleteMany: {}, ...(notes.length ? { create: notes.map((n: any) => ({ content: n.content })).filter((n: any) => n.content) } : {}) } } : {}),
          ...(tasks !== undefined ? { tasks: { deleteMany: {}, ...(tasks.length ? { create: this.sanitizeTaskData(tasks) } : {}) } } : {}),
        },
        include: {
          veterinarians: true,
          clinics: true,
          vaccinations: true,
          medications: true,
          notes: true,
          tasks: true,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to update pet ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async removePet(id: string, userId: string) {
    await this.getPet(id, userId);
    return this.prisma.pet.delete({ where: { id } });
  }

  // --- Vets ---
  async addVet(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    return this.prisma.veterinarian.create({ data: { name: data.name, phone: data.phone, petId } });
  }

  // --- Clinics ---
  async addClinic(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    return this.prisma.emergencyClinic.create({ data: { name: data.name, phone: data.phone, petId } });
  }

  // --- Vaccinations ---
  async addVaccination(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    const sanitized = this.sanitizeVaccinationData([data])[0];
    if (!sanitized) throw new NotFoundException('Invalid vaccination data');
    return this.prisma.petVaccination.create({ data: { ...sanitized, petId } });
  }

  // --- Medications ---
  async addMedication(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    const sanitized = this.sanitizeMedicationData([data])[0];
    if (!sanitized) throw new NotFoundException('Invalid medication data');
    return this.prisma.petMedication.create({ data: { ...sanitized, petId } });
  }

  // --- Notes ---
  async addNote(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    return this.prisma.petNote.create({ data: { content: data.content, petId } });
  }

  // --- Tasks ---
  async addTask(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    const sanitized = this.sanitizeTaskData([data])[0];
    if (!sanitized) throw new NotFoundException('Invalid task data');
    return this.prisma.petTask.create({ data: { ...sanitized, petId } });
  }
}
