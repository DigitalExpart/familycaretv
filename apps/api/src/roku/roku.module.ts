import { Module } from '@nestjs/common';
import { RokuService } from './roku.service';
import { RokuController } from './roku.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [RokuController],
  providers: [RokuService],
})
export class RokuModule {}
