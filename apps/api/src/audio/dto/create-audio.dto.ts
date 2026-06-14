import { IsString, IsEnum } from 'class-validator';
import { AudioType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAudioDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  audioUrl: string;

  @ApiProperty({ enum: AudioType })
  @IsEnum(AudioType)
  type: AudioType;
}
