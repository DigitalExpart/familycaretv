import { Injectable } from '@nestjs/common';
import { CreateBibleVerseDto } from './dto/create-bible-verse.dto';
import { UpdateBibleVerseDto } from './dto/update-bible-verse.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BibleVersesService {
  constructor(private prisma: PrismaService) {}

  create(createBibleVerseDto: CreateBibleVerseDto) {
    return this.prisma.bibleVerse.create({
      data: createBibleVerseDto,
    });
  }

  findAll() {
    return this.prisma.bibleVerse.findMany({
      orderBy: { scheduledDate: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.bibleVerse.findUnique({
      where: { id },
    });
  }

  update(id: string, updateBibleVerseDto: UpdateBibleVerseDto) {
    return this.prisma.bibleVerse.update({
      where: { id },
      data: updateBibleVerseDto,
    });
  }

  remove(id: string) {
    return this.prisma.bibleVerse.delete({
      where: { id },
    });
  }
}
