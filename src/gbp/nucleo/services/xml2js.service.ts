import { Injectable } from '@nestjs/common';
import { parseString, ParserOptions } from 'xml2js';
import { LoginResponse } from '../interfaces/login-response.interface';
import { BrandsResponse } from '../interfaces/brands-response.interface';
import { ProductsResponse } from '../interfaces/products-response.interface';
import { BrandItem } from '../interfaces/brand-item.interface';
import { ProductItem } from '../interfaces/product-Item.interface';
import { ProductsStorageGroupResponse } from '../interfaces/products-storage-group-response.interface';
import { ProductStorageGroupItem } from '../interfaces/product-storage-group-item.interface';
import { ImagesResponse } from '../interfaces/images-response.interface';
import { ImageItem } from '../interfaces/image-item';
import { ProductCombinedItem } from '../interfaces/product-combined-item.interface';
import { ProductStructuredItem } from '../interfaces/product-structured-item.interface';
import { SkuItem } from '../interfaces/sku-item.interface';
import { FileItem } from '../interfaces/file-item.interface';

@Injectable()
export class Xml2jsService {
  
  private parserOptions: ParserOptions = {
    explicitArray: false,
    ignoreAttrs: true,
  };

  async xmlToObjectLoginResponse(xml: string): Promise<LoginResponse> {
    return this.parseXml<LoginResponse>(xml, 'parseLoginResponseXmlToJson');
  }

  async xmlToObjectBrandResponse(xmlString: string): Promise<BrandsResponse> {
    return this.parseXml<BrandsResponse>(xmlString, 'xmlToObjectBrandResponse');
  }

  async xmlToObjectProductsResponse(xmlString: string): Promise<ProductsResponse> {
    return this.parseXml<ProductsResponse>(xmlString, 'xmlToObjectProductsResponse');
  }

  async xmlToObjectProductsStorageGroupResponse(xmlString: string): Promise<ProductsStorageGroupResponse> {
    return this.parseXml<ProductsStorageGroupResponse>(xmlString, 'xmlToObjectProductsStorageGroupResponse');
  }

  async xmlToObjectImageResponse(xmlString: string): Promise<ImagesResponse> {
    return this.parseXml<ImagesResponse>(xmlString, 'xmlToObjectImageResponse');
  }

  async parseBrandsSoapResponse(soapResponse: string): Promise<BrandItem[]> {
    try {
      const soapBody = await this.extractSoapBody(soapResponse);
      const xmlData = this.extractXmlBrandsData(soapBody);

      if (xmlData == 'Not data found.'){
        return [];
      }

      const objectData: BrandsResponse = await this.xmlToObjectBrandResponse(xmlData);
      return this.transformBrandItem(objectData);
    } catch (error) {
      throw new Error(`parseBrandsSoapResponse | ${error.message}`);
    }
  }

  async parseProductsSoapResponse(soapResponse: string): Promise<ProductItem[]> {
    try {
      const soapBody = await this.extractSoapBody(soapResponse);
      const xmlData = this.extractXmlProductsData(soapBody);

      if (xmlData == 'Not data found.'){
        return [];
      }

      const objectData: ProductsResponse = await this.xmlToObjectProductsResponse(xmlData);
      return this.transformProductItem(objectData);
    } catch (error) {
      throw new Error(`parseProductsSoapResponse | ${error.message}`);
    }
  }

  async parseProductsStorageGroupSoapResponse(soapResponse: string): Promise<ProductStorageGroupItem[]> {
    try {
      const soapBody = await this.extractSoapBody(soapResponse);
      const xmlData = this.extractXmlProductsStorageGroupData(soapBody);

      if (xmlData == 'Not data found.'){
        return [];
      }

      const objectData: ProductsStorageGroupResponse = await this.xmlToObjectProductsStorageGroupResponse(xmlData);
      return this.transformProductStorageGroupItem(objectData);
    } catch (error) {
      throw new Error(`parseProductsStorageGroupSoapResponse | ${error.message}`);
    }
  }

  async parseImagesSoapResponse(soapResponse: string): Promise<ImageItem[]> {
    try {
      const soapBody = await this.extractSoapBody(soapResponse);      
      const xmlData = this.extractXmlImageData(soapBody);    

      if (xmlData == 'Not data found.'){
        return [];
      }

      const objectData: ImagesResponse = await this.xmlToObjectImageResponse(xmlData);
      return this.transformImageItem(objectData);
    } catch (error) {
      throw new Error(`parseImagesSoapResponse | ${error.message}`);
    }
  }

  private parseXml<T>(xml: string, methodName: string): Promise<T> {
    return new Promise((resolve, reject) => {
      parseString(xml, this.parserOptions, (err, result) => {
        if (err) {
          reject(new Error(`${methodName} | Error al parsear XML | ${err.message}`));
        } else {
          resolve(result as T);
        }
      });
    });
  }

  private async extractSoapBody(soapResponse: string): Promise<any> {
    
    const result = await this.parseXml<any>(soapResponse, 'extractSoapBody');
    const soapEnvelope = result['soap:Envelope'];

    if (!soapEnvelope) {
      throw new Error(`extractSoapBody | Formato de respuesta SOAP incorrecto`);
    }

    const soapBody = soapEnvelope['soap:Body'];

    if (!soapBody || Object.keys(soapBody).length === 0) {
      throw new Error(`extractSoapBody | Formato de respuesta SOAP incorrecto`);
    }

    return soapBody;
  }

  private extractXmlBrandsData(soapBody: any): string {

    const brand_funGetXMLDataResult: string = soapBody.Brand_funGetXMLDataResponse.Brand_funGetXMLDataResult;
    if (!brand_funGetXMLDataResult) {
      throw new Error(`extractXmlBrandsData | No se encontró Brand_funGetXMLDataResult en el cuerpo SOAP`);
    }
    return brand_funGetXMLDataResult;
  }

  private extractXmlProductsData(soapBody: any): string {

    const wsFullJaus_Item_funGetXMLDataResult: string = soapBody.wsFullJaus_Item_funGetXMLDataResponse.wsFullJaus_Item_funGetXMLDataResult;
    if (!wsFullJaus_Item_funGetXMLDataResult) {
      throw new Error(`extractXmlProductsData | No se encontró wsFullJaus_Item_funGetXMLDataResult en el cuerpo SOAP`);
    }
    return wsFullJaus_Item_funGetXMLDataResult;
  }

  private extractXmlProductsStorageGroupData(soapBody: any): string {

    const wsFullJaus_Item_funGetXMLDataResult: string = soapBody.Item_funGetXMLDataByStorageGroupResponse.Item_funGetXMLDataByStorageGroupResult;
    if (!wsFullJaus_Item_funGetXMLDataResult) {
      throw new Error(`extractXmlProductsStorageGroupData | No se encontró wsFullJaus_Item_funGetXMLDataResult en el cuerpo SOAP`);
    }
    return wsFullJaus_Item_funGetXMLDataResult;
  }

  private extractXmlImageData(soapBody: any): string {

    const ItemImages_funGetXMLDataResult: string = soapBody.ItemImages_funGetXMLDataResponse.ItemImages_funGetXMLDataResult;
    if (!ItemImages_funGetXMLDataResult) {
      throw new Error(`extractXmlImageData | No se encontró ItemImages_funGetXMLDataResult en el cuerpo SOAP`);
    }
    return ItemImages_funGetXMLDataResult;
  }

  private transformBrandItem(objectData: BrandsResponse): BrandItem[] {

    if (!objectData || !objectData.NewDataSet || !objectData.NewDataSet.Table) {
      throw new Error(`objectData | Formato de datos incorrecto`);
    }
    return objectData.NewDataSet.Table.map(item => ({
      externalId: item.brand_id,
      name: item.brand_desc,
      logo: ''
    }));
  }

  private transformProductItem(objectData: ProductsResponse): ProductItem[] {

    if (!objectData || !objectData.NewDataSet || !objectData.NewDataSet.Table) {
      throw new Error(`objectData | Formato de datos incorrecto`);
    }

    return objectData.NewDataSet.Table
    .map(item => (
      {
        item_id: item.item_id || '',
        item_code: item.item_code || '',
        item_desc: item.item_desc || '',
        item_detail: item.item_detail || '',
        item_vendorCode: item.item_vendorCode || '',
        cat_id: item.cat_id || '',
        subcat_id: item.subcat_id || '',
        brand_id: item.brand_id || '',
        pres_id: item.pres_id || '',
        item_upb: item.item_upb || '',
        item_upp: item.item_upp || '',
        item_cantMin: item.item_cantMin || '',
        item_cantOpt: item.item_cantOpt || '',
        item_mult: item.item_mult || '',
        item_commission: item.item_commission || '',
        item_guarantee: item.item_guarantee || '',
        item_expser: item.item_expser || '',
        item_made: item.item_made || '',
        item_web: item.item_web || '',
        item_annotation: item.item_annotation || '',
        item_annotation1: item.item_annotation1 || '',
        item_annotation2: item.item_annotation2 || '',
        item_newness: item.item_newness || '',
        item_liquidation: item.item_liquidation || '',
        item_withDecimal: item.item_withDecimal || '',
        supp_id: item.supp_id || '',
        item_qtyMin1: item.item_qtyMin1 || '',
        item_qtyMin2: item.item_qtyMin2 || '',
        item_qtyMin3: item.item_qtyMin3 || '',
        item_markup_1: item.item_markup_1 || '',
        item_markup_2: item.item_markup_2 || '',
        item_markup_3: item.item_markup_3 || '',
        item_markup_4: item.item_markup_4 || '',
        item_markup_5: item.item_markup_5 || '',
        item_markup_6: item.item_markup_6 || '',
        item_markup_7: item.item_markup_7 || '',
        item_markup_8: item.item_markup_8 || '',
        item_weight: item.item_weight || '',
        item_volume: item.item_volume || '',
        item_not4Sale: item.item_not4Sale || '',
        item_disabled: item.item_disabled || '',
        item_disabledInBalance: item.item_disabledInBalance || '',
        mu_id: item.mu_id || '',
        stock: item.stock || '',
        tax_id: item.tax_id || '',
        tax_percentage: item.tax_percentage || '',
        tax_id_II: item.tax_id_II || '',
        tax_percentage_II: item.tax_percentage_II || '',
        imageExisting: item.imageExisting || '',
        subcataux_id: item.subcataux_id || '',
        item_markup_9: item.item_markup_9 || '',
        item_markup_10: item.item_markup_10 || '',
        item_markup_11: item.item_markup_11 || '',
        item_markup_12: item.item_markup_12 || '',
        item_markup_13: item.item_markup_13 || '',
        item_markup_14: item.item_markup_14 || '',
        item_markup_15: item.item_markup_15 || '',
        item_markup_16: item.item_markup_16 || '',
        item_WebSite_desc: item.item_WebSite_desc || '',
        item_higth: item.item_higth || '',
        item_wide: item.item_wide || '',
        item_large: item.item_large || '',
        cat_desc: item.cat_desc || '',
        subcat_desc: item.subcat_desc || '',
        brand_desc: item.brand_desc || ''
      }
    ));
  }

  private transformProductStorageGroupItem(objectData: ProductsStorageGroupResponse): ProductStorageGroupItem[] {

    if (!objectData || !objectData.NewDataSet || !objectData.NewDataSet.Table) {
      throw new Error(`objectData | Formato de datos incorrecto`);
    }
  
    return objectData.NewDataSet.Table
    .map(item => ({
      item_id: item.item_id || '',
      item_code: item.item_code || '',
      item_desc: item.item_desc || '',
      item_detail: item.item_detail || '',
      item_vendorCode: item.item_vendorCode || '',
      cat_id: item.cat_id || '',
      subcat_id: item.subcat_id || '',
      brand_id: item.brand_id || '',
      pres_id: item.pres_id || '',
      item_upb: item.item_upb || '',
      item_upp: item.item_upp || '',
      item_cantMin: item.item_cantMin || '',
      item_cantOpt: item.item_cantOpt || '',
      item_mult: item.item_mult || '',
      item_commission: item.item_commission || '',
      item_guarantee: item.item_guarantee || '',
      item_expser: item.item_expser || '',
      item_made: item.item_made || '',
      item_web: item.item_web || '',
      item_annotation: item.item_annotation || '',
      item_annotation1: item.item_annotation1 || '',
      item_annotation2: item.item_annotation2 || '',
      item_newness: item.item_newness || '',
      item_liquidation: item.item_liquidation || '',
      item_withDecimal: item.item_withDecimal || '',
      supp_id: item.supp_id || '',
      item_qtyMin1: item.item_qtyMin1 || '',
      item_qtyMin2: item.item_qtyMin2 || '',
      item_qtyMin3: item.item_qtyMin3 || '',
      item_markup_1: item.item_markup_1 || '',
      item_markup_2: item.item_markup_2 || '',
      item_markup_3: item.item_markup_3 || '',
      item_markup_4: item.item_markup_4 || '',
      item_markup_5: item.item_markup_5 || '',
      item_markup_6: item.item_markup_6 || '',
      item_markup_7: item.item_markup_7 || '',
      item_markup_8: item.item_markup_8 || '',
      item_markup_9: item.item_markup_9 || '',
      item_markup_10: item.item_markup_10 || '',
      item_markup_11: item.item_markup_11 || '',
      item_markup_12: item.item_markup_12 || '',
      item_markup_13: item.item_markup_13 || '',
      item_markup_14: item.item_markup_14 || '',
      item_markup_15: item.item_markup_15 || '',
      item_markup_16: item.item_markup_16 || '',
      item_weight: item.item_weight || '',
      item_not4Sale: item.item_not4Sale || '',
      item_disabled: item.item_disabled || '',
      item_disabledInBalance: item.item_disabledInBalance || '',
      mu_id: item.mu_id || '',
      stock: item.stock || '',
      tax_id: item.tax_id || '',
      tax_percentage: item.tax_percentage || '',
      tax_id_II: item.tax_id_II || '',
      tax_percentage_II: item.tax_percentage_II || '',
      imageExisting: item.imageExisting || '',
      subcataux_id: item.subcataux_id || '',
      item_WebSite_desc: item.item_WebSite_desc || '',
      item_wide: item.item_wide || '',
      item_large: item.item_large || '',
      item_higth: item.item_higth || '',

      PhisicalStock: item.PhisicalStock || '',
      option_id: item.option_id || '',
    }));
  }

  private transformImageItem(objectData: ImagesResponse): ImageItem[]{
    
    if (!objectData || !objectData.NewDataSet || !objectData.NewDataSet.Table) {
      throw new Error(`objectData | Formato de datos incorrecto`);
    }

    const tableData = Array.isArray(objectData.NewDataSet.Table)
    ? objectData.NewDataSet.Table
    : [objectData.NewDataSet.Table];

    return tableData.map(item => ({
        comp_id: item.comp_id,
        item_id: item.item_id,
        item_picture: item.item_picture,
        Order: item.Order,
    }));
  }

  parseProductStructuredItem(productCombinedItem: ProductCombinedItem, imageItems: ImageItem[]): ProductStructuredItem{

    const ImageItemMain: ImageItem = imageItems.find(item => item.Order === "-1");
    
    const file: FileItem | null = ImageItemMain 
    ? {
        file: `www.simulacion.url.s3.com/${ImageItemMain.item_id}_order_${ImageItemMain.Order}`,
        order: Number(ImageItemMain.Order),
        productId: ImageItemMain.item_id
      } 
    : null;
    
    const fileItems: FileItem[] = imageItems.length > 0 
    ? imageItems.map(imageItem => ({
        file: `www.simulacion.url.s3.com/${imageItem.item_id}_order_${imageItem.Order}`,
        order: Number(imageItem.Order),
        productId: imageItem.item_id
      }))
    : [];

    const sku: SkuItem = {
      eanCode: productCombinedItem.item_vendorCode,
      referenceCode: productCombinedItem.item_code,
      name: productCombinedItem.item_desc,
      sizeWidth: Number(productCombinedItem.item_wide),
      sizeHeight: Number(productCombinedItem.item_higth),
      sizeLength: Number(productCombinedItem.item_large),
      volumen: Number(productCombinedItem.item_volume),
      weight: Number(productCombinedItem.item_weight),
      active: (productCombinedItem.item_disabled == "true"),
      stockInfinite: false,
      stockTotal: 0,
      stockCommited: 0,
      stockSecurity: 0,
      priceList: Number(productCombinedItem.item_upb),
      priceCost: 0,
      files: fileItems,
    };

    const productStructuredItem: ProductStructuredItem = {
      externalId: productCombinedItem.item_id,
      name: productCombinedItem.item_desc,
      categoryId: productCombinedItem.cat_id,
      brandId: productCombinedItem.brand_id,
      factoryWarranty: productCombinedItem.item_guarantee,
      description: `${productCombinedItem.item_annotation} ${productCombinedItem.item_annotation1} ${productCombinedItem.item_annotation2}`,
      active: (productCombinedItem.item_disabled == "true"),
      file: file,
      skus: [sku]
    };

    return productStructuredItem;

  }

}