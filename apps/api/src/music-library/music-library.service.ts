import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MusicLibraryService implements OnModuleInit {
  private readonly logger = new Logger(MusicLibraryService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultTracksIfEmpty();
  }

  async seedDefaultTracksIfEmpty() {
    try {
      const count = await this.prisma.musicTrack.count();
      if (count > 0) return;

      this.logger.log('No music tracks found in database. Auto-seeding curated wellness library...');

      const defaultCategories = [
        {
          name: 'Peaceful & Relaxation',
          displayOrder: 1,
          tracks: [
            {
              title: 'Peaceful Piano & Nature',
              description: 'Calming piano melodies with gentle acoustic resonance for relaxation',
              audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              youtubeUrl: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
              displayOrder: 1,
            },
            {
              title: 'Morning Sunrise Symphony',
              description: 'Uplifting classical harmony to start your day with gratitude',
              audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
              youtubeUrl: 'https://www.youtube.com/watch?v=2OEL4P1Rz04',
              displayOrder: 2,
            },
          ],
        },
        {
          name: 'Calm & Meditation',
          displayOrder: 2,
          tracks: [
            {
              title: 'Calming Ocean Waves',
              description: 'Ambient soundscape with rhythmic ocean swells for deep peace',
              audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
              youtubeUrl: 'https://www.youtube.com/watch?v=bn9F19Hi1Lk',
              displayOrder: 1,
            },
            {
              title: 'Gentle Acoustic Reflection',
              description: 'Soft guitar fingerpicking for quiet contemplation and rest',
              audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
              youtubeUrl: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
              displayOrder: 2,
            },
          ],
        },
        {
          name: 'Sleep & Healing',
          displayOrder: 3,
          tracks: [
            {
              title: 'Forest Stream & Birds',
              description: 'Gentle woodland water stream and birdsong for tranquil focus',
              audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
              youtubeUrl: 'https://www.youtube.com/watch?v=eKFTSSKCzWA',
              displayOrder: 1,
            },
            {
              title: 'Deep Rest Nightfall',
              description: 'Gentle ambient drone for deep restorative sleep and prayer',
              audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
              youtubeUrl: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
              displayOrder: 2,
            },
          ],
        },
      ];

      for (const cat of defaultCategories) {
        let category = await this.prisma.musicCategory.findFirst({
          where: { name: cat.name },
        });

        if (!category) {
          category = await this.prisma.musicCategory.create({
            data: {
              name: cat.name,
              displayOrder: cat.displayOrder,
            },
          });
        }

        for (const track of cat.tracks) {
          const exists = await this.prisma.musicTrack.findFirst({
            where: { title: track.title, categoryId: category.id },
          });

          if (!exists) {
            await this.prisma.musicTrack.create({
              data: {
                title: track.title,
                description: track.description,
                audioUrl: track.audioUrl,
                youtubeUrl: track.youtubeUrl,
                displayOrder: track.displayOrder,
                categoryId: category.id,
                enabled: true,
                language: 'en',
              },
            });
          }
        }
      }
      this.logger.log('Successfully seeded default music library');
    } catch (err) {
      this.logger.error('Failed to seed default music library:', err);
    }
  }

  async getCategories(includeDisabled = false) {
    const existingCount = await this.prisma.musicCategory.count();
    if (existingCount === 0) {
      await this.seedDefaultTracksIfEmpty();
    }

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
    const existingCount = await this.prisma.musicTrack.count();
    if (existingCount === 0) {
      await this.seedDefaultTracksIfEmpty();
    }

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
