import { Module } from '@nestjs/common';
import { MusicLibraryService } from './music-library.service';
import { MusicLibraryController } from './music-library.controller';

@Module({
  controllers: [MusicLibraryController],
  providers: [MusicLibraryService],
  exports: [MusicLibraryService],
})
export class MusicLibraryModule {}
