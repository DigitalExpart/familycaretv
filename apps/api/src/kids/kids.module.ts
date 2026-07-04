import { Module } from '@nestjs/common';
import { KidsService } from './kids.service';
import { KidsController } from './kids.controller';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [RemindersModule],
  controllers: [KidsController],
  providers: [KidsService],
  exports: [KidsService],
})
export class KidsModule {}
