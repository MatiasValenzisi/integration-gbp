// Soap 1.2
export interface BrandsResponse {
  NewDataSet: {
    Table: {
      brand_id: string;
      brand_desc: string;
    }[];
  };
}