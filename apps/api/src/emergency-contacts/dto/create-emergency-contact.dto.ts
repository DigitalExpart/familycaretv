import { IsString, IsUUID } from 'class-validator';
export class CreateEmergencyContactDto {
  @IsUUID()
  patientId: string;
  @IsString()
  name: string;
  @IsString()
  relationship: string;
  @IsString()
  phone: string;
}
