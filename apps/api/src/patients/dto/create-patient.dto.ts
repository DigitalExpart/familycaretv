import { IsString, IsOptional, IsDateString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatientDto {
  @IsString()
  fullName: string;

  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
