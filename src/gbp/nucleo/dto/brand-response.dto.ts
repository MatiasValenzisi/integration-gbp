import { IsString, IsOptional, IsUrl } from 'class-validator';
import { Expose } from 'class-transformer';

export class BrandResponseDto {
  @IsString()
  @Expose()
  externalId: string;

  @IsString()
  @Expose()
  name: string;

  @IsOptional()
  @IsUrl()
  @Expose()
  logo: string | null;
}