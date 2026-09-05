import { Module } from '@nestjs/common';
import { RokuService } from './roku.service';
import { RokuController } from './roku.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [DatabaseModule, AuthModule, CalendarModule],
  controllers: [RokuController],
  providers: [RokuService],
})
export class RokuModule {}
