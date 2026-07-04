import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class PetsService {
  private readonly logger = new Logger(PetsService.name);

  constructor(private prisma: PrismaService, private remindersService: RemindersService) {}

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
    return medications.map(({ name, dosage, frequency, time }) => ({
      name,
      ...(dosage !== undefined ? { dosage } : {}),
      ...(frequency !== undefined ? { frequency } : {}),
      ...(time !== undefined ? { time } : {}),
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
        },
      });

      if (veterinarians?.length) {
        for (const vet of veterinarians) {
          if (vet.name) await this.addVet(pet.id, userId, vet);
        }
      }
      if (clinics?.length) {
        for (const clinic of clinics) {
          if (clinic.name) await this.addClinic(pet.id, userId, clinic);
        }
      }
      if (vaccinations?.length) {
        for (const vax of vaccinations) {
          if (vax.vaccineName) await this.addVaccination(pet.id, userId, vax);
        }
      }
      if (medications?.length) {
        for (const med of medications) {
          if (med.name) await this.addMedication(pet.id, userId, med);
        }
      }
      if (notes?.length) {
        for (const note of notes) {
          if (note.content) await this.addNote(pet.id, userId, note);
        }
      }
      if (tasks?.length) {
        for (const task of tasks) {
          if (task.title) await this.addTask(pet.id, userId, task);
        }
      }

      return this.getPet(pet.id, userId);

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
    const pet = await this.getPet(petId, userId);
    const sanitized = this.sanitizeVaccinationData([data])[0];
    if (!sanitized) throw new NotFoundException('Invalid vaccination data');
    const vax = await this.prisma.petVaccination.create({ data: { ...sanitized, petId } });
    if (vax.nextDue) {
      await this.remindersService.createReminder({
          userId, type: 'PET_VACCINATION', title: `Pet Vaccination: ${vax.vaccineName}`, message: `${pet.name} is due for ${vax.vaccineName}`,
          scheduledAt: vax.nextDue, sourceType: 'PET_VACCINATION', sourceId: vax.id
      });
    }
    return vax;
  }

  // --- Medications ---
  async addMedication(petId: string, userId: string, data: any) {
    const pet = await this.getPet(petId, userId);
    const sanitized = this.sanitizeMedicationData([data])[0];
    if (!sanitized) throw new NotFoundException('Invalid medication data');
    const med = await this.prisma.petMedication.create({ data: { ...sanitized, petId } });
    if (med.time) {
       const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
       await this.remindersService.syncRecurringReminders(
          userId, 'PET_MEDICATION', med.id, 'PET_MEDICATION',
          `Pet Medication: ${med.name}`, `Time to give ${pet.name} their medication: ${med.name}`,
          ['Everyday'], [med.time], user?.timezone || 'UTC'
       );
    }
    return med;
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

  async updateTask(taskId: string, petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    return this.prisma.petTask.update({ where: { id: taskId }, data });
  }

  async removeTask(taskId: string, petId: string, userId: string) {
    await this.getPet(petId, userId);
    return this.prisma.petTask.delete({ where: { id: taskId } });
  }
}
