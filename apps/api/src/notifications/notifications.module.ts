import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { DatabaseModule } from '../database/database.module';
import { NotificationEngineService } from './notification-engine.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { ExpoPushService } from './expo-push.service';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationEngineService,
    NotificationSchedulerService,
    ExpoPushService
  ],
  exports: [NotificationsService, NotificationEngineService]
})
export class NotificationsModule {}
