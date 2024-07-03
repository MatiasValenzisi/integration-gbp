import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @IsString()
  @Expose()
  token: string;
}
