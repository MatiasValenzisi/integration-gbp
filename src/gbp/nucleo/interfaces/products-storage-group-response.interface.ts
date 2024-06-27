import { ProductStorageGroupItem } from "./product-storage-group-item.interface";

export interface ProductsStorageGroupResponse {
  NewDataSet: {
    Table: ProductStorageGroupItem[];
  };
}