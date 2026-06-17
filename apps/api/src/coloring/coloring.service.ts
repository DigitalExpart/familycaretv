import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ColoringService {
  constructor(private prisma: PrismaService) {}

  async getAllPages(language?: string) {
    const whereClause = language ? { language } : {};
    return this.prisma.coloringPage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async addPage(data: any) {
    return this.prisma.coloringPage.create({ data });
  }

  async removePage(id: string) {
    return this.prisma.coloringPage.delete({ where: { id } });
  }
}
