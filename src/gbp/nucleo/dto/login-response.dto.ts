import { IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @IsUUID()
  @Expose()
  token: string;
}
