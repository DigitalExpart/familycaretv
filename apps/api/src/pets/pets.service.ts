import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async createPet(userId: string, data: any) {
    const { veterinarians, clinics, vaccinations, medications, notes, ...rest } = data;
    
    return this.prisma.pet.create({
      data: {
        ...rest,
        userId,
        ...(veterinarians?.length ? { veterinarians: { create: veterinarians } } : {}),
        ...(clinics?.length ? { clinics: { create: clinics } } : {}),
        ...(vaccinations?.length ? { vaccinations: { create: vaccinations } } : {}),
        ...(medications?.length ? { medications: { create: medications } } : {}),
        ...(notes?.length ? { notes: { create: notes } } : {}),
      },
    });
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
      },
    });
    if (!pet || pet.userId !== userId) throw new NotFoundException('Pet not found');
    return pet;
  }

  async updatePet(id: string, userId: string, data: any) {
    await this.getPet(id, userId); // verify ownership
    return this.prisma.pet.update({ where: { id }, data });
  }

  async removePet(id: string, userId: string) {
    await this.getPet(id, userId);
    return this.prisma.pet.delete({ where: { id } });
  }

  // --- Vets ---
  async addVet(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    return this.prisma.veterinarian.create({ data: { ...data, petId } });
  }

  // --- Clinics ---
  async addClinic(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    return this.prisma.emergencyClinic.create({ data: { ...data, petId } });
  }

  // --- Vaccinations ---
  async addVaccination(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    return this.prisma.petVaccination.create({ data: { ...data, petId } });
  }

  // --- Medications ---
  async addMedication(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    return this.prisma.petMedication.create({ data: { ...data, petId } });
  }

  // --- Notes ---
  async addNote(petId: string, userId: string, data: any) {
    await this.getPet(petId, userId);
    return this.prisma.petNote.create({ data: { ...data, petId } });
  }
}
