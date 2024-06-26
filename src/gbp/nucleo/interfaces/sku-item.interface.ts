import { FileItem } from "./file-item.interface";

export interface SkuItem {
    eanCode: string;
    referenceCode: string;
    name: string;
    sizeWidth: number;
    sizeHeight: number;
    sizeLength: number;
    volumen: number;
    weight: number;
    active: boolean;
    stockInfinite: boolean;
    stockTotal: number;
    stockCommited: number;
    stockSecurity: number;
    priceList: number;
    priceCost: number;
    files: FileItem[];
  }