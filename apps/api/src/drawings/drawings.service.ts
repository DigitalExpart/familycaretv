import { Injectable } from '@nestjs/common';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import { UpdateDrawingDto } from './dto/update-drawing.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DrawingsService {
  constructor(private prisma: PrismaService) {}

  create(createDrawingDto: CreateDrawingDto) {
    return this.prisma.drawing.create({
      data: createDrawingDto,
    });
  }

  findAll(patientId?: string) {
    return this.prisma.drawing.findMany({
      where: patientId ? { patientId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.drawing.findUnique({
      where: { id },
    });
  }

  update(id: string, updateDrawingDto: UpdateDrawingDto) {
    return this.prisma.drawing.update({
      where: { id },
      data: updateDrawingDto,
    });
  }

  remove(id: string) {
    return this.prisma.drawing.delete({
      where: { id },
    });
  }
}
