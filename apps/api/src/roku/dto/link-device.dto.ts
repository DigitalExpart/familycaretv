import { IsString, Length, IsOptional } from 'class-validator';

export class LinkDeviceDto {
  @IsString()
  @Length(6, 8)
  code: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  deviceModel?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;
}
