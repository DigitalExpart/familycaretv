import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PatientsModule } from '../patients/patients.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [PatientsModule, RemindersModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
