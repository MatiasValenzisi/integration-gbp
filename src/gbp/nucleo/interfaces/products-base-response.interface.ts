export interface ProductsBaseResponse {
  NewDataSet: {
    Table: {
      item_id: string,
      item_vendorCode: string,
      item_desc: string,
      cat_id: string,
      brand_id: string,
      item_guarantee: string,
      item_annotation: string,
      item_annotation1: string,
      item_annotation2: string,
      item_disabled: string,
      item_code: string,
      item_wide: string,
      item_higth: string,
      item_large: string,
      item_volume: string, // Es exclusivo de la respuesta del producto base.
      item_weight: string,
      item_upb: string,
      stock: string
    }[];
  };
}