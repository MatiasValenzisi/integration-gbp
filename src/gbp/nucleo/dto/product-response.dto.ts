import { IsString, IsNumber, IsBoolean, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ImageResponseDto } from './image-response.dto';
import { SkuResponseDto } from './sku-response.dto';

export class ProductResponseDto {
  @IsNumber()
  @Expose()
  externalId: number;

  @IsString()
  @Expose()
  name: string;

  @IsNumber()
  @Expose()
  categoryId: number;

  @IsString()
  @Expose()
  brandId: string;

  @IsString()
  @Expose()
  factoryWarranty: string;

  @IsString()
  @Expose()
  description: string;

  @IsBoolean()
  @Expose()
  active: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageResponseDto)
  @Expose()
  file: ImageResponseDto | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuResponseDto)
  @Expose()
  skus: SkuResponseDto[];
}
