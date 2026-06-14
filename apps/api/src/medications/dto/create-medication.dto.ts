import { IsString, IsOptional, IsUUID } from 'class-validator';
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
}
