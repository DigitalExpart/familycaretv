import { Module } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';
import { PatientsModule } from '../patients/patients.module';
import { AiModule } from '../ai/ai.module';

import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [PatientsModule, AiModule, RemindersModule],
  controllers: [MedicationsController],
  providers: [MedicationsService],
})
export class MedicationsModule {}
