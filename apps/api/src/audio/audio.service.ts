import { Injectable } from '@nestjs/common';
import { CreateAudioDto } from './dto/create-audio.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AudioService {
  constructor(private prisma: PrismaService) {}

  create(createAudioDto: CreateAudioDto) {
    return this.prisma.audioTrack.create({
      data: createAudioDto,
    });
  }

  findAll() {
    return this.prisma.audioTrack.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.audioTrack.findUnique({
      where: { id },
    });
  }

  update(id: string, updateAudioDto: UpdateAudioDto) {
    return this.prisma.audioTrack.update({
      where: { id },
      data: updateAudioDto,
    });
  }

  remove(id: string) {
    return this.prisma.audioTrack.delete({
      where: { id },
    });
  }
}
