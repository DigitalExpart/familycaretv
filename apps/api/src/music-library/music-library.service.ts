import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MusicLibraryService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.musicCategory.findMany({
      include: {
        tracks: true,
      },
    });
  }

  async getAllTracks(language?: string) {
    const whereClause = language ? { language } : {};
    return this.prisma.musicTrack.findMany({
      where: whereClause,
      include: { category: true },
    });
  }

  async addCategory(data: any) {
    return this.prisma.musicCategory.create({ data });
  }

  async addTrack(data: any) {
    return this.prisma.musicTrack.create({ data });
  }

  async removeTrack(id: string) {
    return this.prisma.musicTrack.delete({ where: { id } });
  }
}
