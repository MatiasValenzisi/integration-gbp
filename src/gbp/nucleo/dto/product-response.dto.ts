import { ImageResponseDto } from "./image-response.dto";
import { SkuResponseDto } from "./sku-response.dto";

export class ProductResponseDto {
  externalId: number;
  name: string;
  categoryId: string;
  brandId: string;
  factoryWarranty: string;
  description: string;
  active: boolean;
  file: ImageResponseDto | null; // Se utiliza mediante una llamada de imagenes separada y nos quedamos con la del order -1 que equivale a la principal.
  skus: SkuResponseDto[];
}