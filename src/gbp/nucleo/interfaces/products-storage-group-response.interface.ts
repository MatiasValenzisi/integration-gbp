import { ProductStorageGroupItem } from "./product-storage-group-Item.interface";

export interface ProductsStorageGroupResponse {
  NewDataSet: {
    Table: ProductStorageGroupItem[];
  };
}