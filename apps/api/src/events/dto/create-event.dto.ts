import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
export class CreateEventDto {
  @IsUUID()
  patientId: string;
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsDateString()
  eventDate: string;
}
