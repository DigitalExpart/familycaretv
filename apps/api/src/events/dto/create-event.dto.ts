import { IsString, IsOptional, IsUUID, IsDateString, IsEnum, IsInt } from 'class-validator';
import { EventType, ReminderStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ description: 'ISO 8601 Date String' })
  @IsDateString()
  startDateTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  reminderMinutes?: number;

  @ApiPropertyOptional({ enum: ReminderStatus })
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;
}
