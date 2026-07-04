import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async getAllBooks(language?: string) {
    const whereClause: any = {};
    if (language) {
      whereClause.language = language;
    }
    return this.prisma.book.findMany({
      where: whereClause,
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getFeaturedBooks(language?: string) {
    const whereClause: any = { featured: true };
    if (language) {
      whereClause.language = language;
    }
    return this.prisma.book.findMany({
      where: whereClause,
      orderBy: { displayOrder: 'asc' },
    });
  }

  async addBook(data: any) {
    return this.prisma.book.create({ data });
  }

  async updateBook(id: string, data: any) {
    return this.prisma.book.update({
      where: { id },
      data,
    });
  }

  async removeBook(id: string) {
    return this.prisma.book.delete({ where: { id } });
  }
}
