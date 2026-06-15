import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AudioType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAudioDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  audioUrl?: string;

  @ApiProperty({ enum: AudioType })
  @IsEnum(AudioType)
  type: AudioType;
}
