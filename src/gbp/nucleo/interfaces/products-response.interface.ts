import { ProductItem } from "./product-Item.interface";

export interface ProductsResponse {
  NewDataSet: {
    Table: ProductItem[];
  };
}