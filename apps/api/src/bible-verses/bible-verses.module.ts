import { Module } from '@nestjs/common';
import { BibleVersesService } from './bible-verses.service';
import { BibleVersesController } from './bible-verses.controller';

@Module({
  controllers: [BibleVersesController],
  providers: [BibleVersesService],
})
export class BibleVersesModule {}
