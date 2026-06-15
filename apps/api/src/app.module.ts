import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
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
import { BibleVersesModule } from './bible-verses/bible-verses.module';
import { DrawingsModule } from './drawings/drawings.module';
import { AudioModule } from './audio/audio.module';
import { StripeModule } from './stripe/stripe.module';
import { RokuModule } from './roku/roku.module';
import { NotificationsModule } from './notifications/notifications.module';
import { APP_GUARD } from '@nestjs/core';
import { SubscriptionGuard } from './common/guards/subscription.guard';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    BibleVersesModule,
    DrawingsModule,
    AudioModule,
    StripeModule,
    RokuModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule {}
