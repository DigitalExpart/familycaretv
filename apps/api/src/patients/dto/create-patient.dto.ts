import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  fullName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
