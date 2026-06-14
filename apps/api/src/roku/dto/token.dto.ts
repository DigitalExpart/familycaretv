import { IsString, IsUUID } from 'class-validator';

export class TokenDto {
  @IsUUID()
  deviceId: string;
}
