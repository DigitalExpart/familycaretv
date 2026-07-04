import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarAggregatorService } from './calendar.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [CalendarController],
  providers: [CalendarAggregatorService, PrismaService],
})
export class CalendarModule {}
