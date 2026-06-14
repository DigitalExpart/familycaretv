import { Module } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';
import { PatientsModule } from '../patients/patients.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PatientsModule, AiModule],
  controllers: [MedicationsController],
  providers: [MedicationsService],
})
export class MedicationsModule {}
