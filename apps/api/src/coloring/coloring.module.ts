import { Module } from '@nestjs/common';
import { ColoringService } from './coloring.service';
import { ColoringController } from './coloring.controller';

@Module({
  controllers: [ColoringController],
  providers: [ColoringService],
  exports: [ColoringService],
})
export class ColoringModule {}
