import { Injectable } from '@nestjs/common';
import { parseString, ParserOptions } from 'xml2js';
import { LoginResponse } from '../interfaces/login-response.interface';
import { BrandsResponse } from '../interfaces/brands-response.interface';
import { ProductsResponse } from '../interfaces/products-response.interface';
import { BrandItem } from '../interfaces/brand-Item.interface';
import { ProductItem } from '../interfaces/product-Item.interface';

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

  async parseBrandsSoapResponse(soapResponse: string): Promise<BrandItem[]> {
    try {
      const soapBody = await this.extractSoapBody(soapResponse);
      const xmlData = this.extractXmlBrandsData(soapBody);
      const objectData: BrandsResponse = await this.xmlToObjectBrandResponse(xmlData);
      return this.transformBrandItem(objectData);
    } catch (error) {
      throw new Error(`parseBrandsSoapResponse | ${error.message}`);
    }
  }

  async parseProductsWithStockSoapResponse(soapResponse: string): Promise<ProductItem[]> {
    try {
      const soapBody = await this.extractSoapBody(soapResponse);
      const xmlData = this.extractXmlProductsData(soapBody);
      const objectData: ProductsResponse = await this.xmlToObjectProductsResponse(xmlData);
      return this.transformProductItem(objectData);
    } catch (error) {
      throw new Error(`parseProductsWithStockSoapResponse | ${error.message}`);
    }
  }

  async parseProductsWithStockPaginatedSoapResponse(soapResponse: string): Promise<ProductItem[]> {
    try {
      const soapBody = await this.extractSoapBody(soapResponse);
      const xmlData = this.extractXmlProductsPaginatedData(soapBody);
      const objectData: ProductsResponse = await this.xmlToObjectProductsResponse(xmlData);
      return this.transformProductItem(objectData);
    } catch (error) {
      throw new Error(`parseProductsWithStockPaginatedSoapResponse | ${error.message}`);
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
      throw new Error(`extractXmlData | No se encontró Brand_funGetXMLDataResult en el cuerpo SOAP`);
    }
    return brand_funGetXMLDataResult;
  }

  private extractXmlProductsData(soapBody: any): string {

    const wsFullJaus_Item_funGetXMLDataResult: string = soapBody.wsFullJaus_Item_funGetXMLDataResponse.wsFullJaus_Item_funGetXMLDataResult;
    if (!wsFullJaus_Item_funGetXMLDataResult) {
      throw new Error(`extractXmlData | No se encontró wsFullJaus_Item_funGetXMLDataResult en el cuerpo SOAP`);
    }
    return wsFullJaus_Item_funGetXMLDataResult;
  }

  private extractXmlProductsPaginatedData(soapBody: any): string {

    const wsFullJaus_Item_funGetXMLData_PaginatedResult: string = soapBody.wsFullJaus_Item_funGetXMLData_PaginatedResponse.wsFullJaus_Item_funGetXMLData_PaginatedResult;
    if (!wsFullJaus_Item_funGetXMLData_PaginatedResult) {
      throw new Error(`extractXmlData | No se encontró wsFullJaus_Item_funGetXMLData_PaginatedResult en el cuerpo SOAP`);
    }
    return wsFullJaus_Item_funGetXMLData_PaginatedResult;
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
    .filter(item => Number(item.stock) > 0)
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

}