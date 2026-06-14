import { IsString, Length } from 'class-validator';

export class LinkDeviceDto {
  @IsString()
  @Length(6, 6)
  code: string;
}
