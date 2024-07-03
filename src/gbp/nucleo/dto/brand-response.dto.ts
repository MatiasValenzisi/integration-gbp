import { IsString, IsOptional, IsUrl, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class BrandResponseDto {
  @IsNumber()
  @Expose()
  externalId: number;

  @IsString()
  @Expose()
  name: string;

  @IsOptional()
  @IsUrl()
  @Expose()
  logo: string | null;
}