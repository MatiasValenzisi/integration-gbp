import { ImageResponseDto } from "./image-response.dto";

export class SkuResponseDto {
  eanCode: string;
  referenceCode: string;
  name: string;
  sizeWidth: number;
  sizeHeight: number;
  sizeLength: number;
  volumen: number | null; // Es exclusivo de la respuesta del producto base. En el otro caso se realiza una formula.
  weight: number;
  active: boolean;
  stockInfinite: boolean;
  stockTotal: number;
  stockCommited: number;
  stockSecurity: number;
  priceList: number;
  priceCost: number;
  files: ImageResponseDto[] | null; // Se utiliza mediante una llamada de imagenes separada.
}