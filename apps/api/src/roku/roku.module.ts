import { Module } from '@nestjs/common';
import { RokuService } from './roku.service';
import { RokuController } from './roku.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

import { CalendarModule } from '../calendar/calendar.module';
import { MusicLibraryModule } from '../music-library/music-library.module';

@Module({
  imports: [DatabaseModule, AuthModule, CalendarModule, MusicLibraryModule],
  controllers: [RokuController],
  providers: [RokuService],
})
export class RokuModule {}
