import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MusicLibraryService {
  constructor(private prisma: PrismaService) {}

  async getCategories(includeDisabled = false) {
    return this.prisma.musicCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        tracks: {
          where: includeDisabled ? {} : { enabled: true },
          orderBy: { displayOrder: 'asc' }
        },
      },
    });
  }

  async getAllTracks(language?: string, includeDisabled = false, search?: string) {
    const whereClause: Prisma.MusicTrackWhereInput = {};
    if (language) {
      whereClause.language = language;
    }
    if (!includeDisabled) {
      whereClause.enabled = true;
    }
    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.musicTrack.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { displayOrder: 'asc' }
    });
  }

  async addCategory(data: any) {
    return this.prisma.musicCategory.create({ data });
  }

  async addTrack(data: any) {
    return this.prisma.musicTrack.create({ data });
  }

  async updateTrack(id: string, data: any) {
    return this.prisma.musicTrack.update({
      where: { id },
      data,
    });
  }

  async removeTrack(id: string) {
    return this.prisma.musicTrack.delete({ where: { id } });
  }
}
