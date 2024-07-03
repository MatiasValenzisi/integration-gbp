import { IsString, IsNumber, IsBoolean, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ImageResponseDto } from './image-response.dto';

export class SkuResponseDto {
  @IsString()
  @Expose()
  eanCode: string;

  @IsString()
  @Expose()
  referenceCode: string;

  @IsString()
  @Expose()
  name: string;

  @IsNumber()
  @Expose()
  sizeWidth: number;

  @IsNumber()
  @Expose()
  sizeHeight: number;

  @IsNumber()
  @Expose()
  sizeLength: number;

  @IsOptional()
  @IsNumber()
  @Expose()
  volumen: number | null;

  @IsNumber()
  @Expose()
  weight: number;

  @IsBoolean()
  @Expose()
  active: boolean;

  @IsBoolean()
  @Expose()
  stockInfinite: boolean;

  @IsNumber()
  @Expose()
  stockTotal: number;

  @IsNumber()
  @Expose()
  stockCommited: number;

  @IsNumber()
  @Expose()
  stockSecurity: number;

  @IsNumber()
  @Expose()
  priceList: number;

  @IsNumber()
  @Expose()
  priceCost: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageResponseDto)
  @Expose()
  files: ImageResponseDto[] | null;
}
