import { IsString, IsOptional, IsUUID } from 'class-validator';

export class TokenDto {
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @IsOptional()
  @IsString()
  code?: string;
}
