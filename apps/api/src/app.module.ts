import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { EmergencyContactsModule } from './emergency-contacts/emergency-contacts.module';
import { MedicationsModule } from './medications/medications.module';
import { EventsModule } from './events/events.module';
import { NotesModule } from './notes/notes.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 3600000,
      limit: 20,
    }]),
    AuthModule,
    UsersModule,
    DatabaseModule,
    HealthModule,
    PatientsModule,
    DoctorsModule,
    EmergencyContactsModule,
    MedicationsModule,
    EventsModule,
    NotesModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
