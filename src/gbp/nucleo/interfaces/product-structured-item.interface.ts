import { FileItem } from './file-item.interface';
import { SkuItem } from './sku-item.interface';

export interface ProductStructuredItem {
  externalId: string;
  name: string;
  categoryId: string;
  brandId: string;
  factoryWarranty: string;
  description: string;
  active: boolean;
  file: FileItem;
  skus: SkuItem[];
}