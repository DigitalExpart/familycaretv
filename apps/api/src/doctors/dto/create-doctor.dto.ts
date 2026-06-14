import { IsString, IsOptional, IsEmail, IsUUID } from 'class-validator';

export class CreateDoctorDto {
  @IsUUID()
  patientId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
