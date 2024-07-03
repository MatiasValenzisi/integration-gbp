export interface ProductsStorageGroupResponse {
  NewDataSet: {
    Table: {
      item_id: number,
      item_vendorCode: string,
      item_desc: string,
      cat_id: number,
      brand_id: string,
      item_guarantee: string,
      item_annotation: string,
      item_annotation1: string,
      item_annotation2: string,
      item_disabled: string,
      item_code: string,
      item_wide: number,
      item_higth: number,
      item_large: number,
      item_weight: number,
      item_upb: string,
      stock: string
    }[];
  };
}