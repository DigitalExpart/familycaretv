import { IsString, IsOptional, IsUUID, IsArray, IsNumber } from 'class-validator';
export class CreateMedicationDto {
  @IsUUID()
  patientId: string;
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  dosage?: string;
  @IsOptional()
  @IsString()
  frequency?: string;
  @IsOptional()
  @IsString()
  purpose?: string;
  @IsOptional()
  @IsString()
  sideEffects?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  daysOfWeek?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timesOfDay?: string[];

  @IsOptional()
  @IsNumber()
  durationWeeks?: number;
}
