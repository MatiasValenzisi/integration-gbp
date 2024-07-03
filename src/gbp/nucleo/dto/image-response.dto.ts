import { IsString, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class ImageResponseDto {
  @IsString()
  @Expose()
  file: string;

  @IsNumber()
  @Expose()
  order: number;

  @IsNumber()
  @Expose()
  productId: number;
}
