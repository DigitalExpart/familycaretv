import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MedicationLookupDto {
  @ApiProperty({ example: 'Metformin' })
  @IsString()
  medication: string;

  @ApiProperty({ enum: ['en', 'es'], example: 'en' })
  @IsIn(['en', 'es'])
  language: 'en' | 'es';
}
