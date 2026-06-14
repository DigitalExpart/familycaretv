import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBibleVerseDto {
  @ApiProperty()
  @IsString()
  verse: string;

  @ApiProperty()
  @IsString()
  reference: string;

  @ApiProperty({ description: 'ISO 8601 Date String' })
  @IsDateString()
  scheduledDate: string;
}
