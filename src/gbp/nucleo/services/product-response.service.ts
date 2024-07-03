import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Xml2jsService } from './xml2js.service';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductsBaseResponse } from '../interfaces/products-base-response.interface';
import { ProductsStorageGroupResponse } from '../interfaces/product-storage-group-response.interface';

@Injectable()
export class ProductResponseService {

  constructor(private readonly logger: Logger, private readonly xml2jsService: Xml2jsService) {}

  async parseResponseToProductBaseResponseDtoArray(soapResponse: string): Promise<ProductResponseDto[]> {    
    try {
      const soapBody = await this.xml2jsService.extractSoapBody(soapResponse);
      const xmlData: string = this.extractXmlProductsBaseData(soapBody);
      
      if (xmlData === 'Not data found.') {
        return [];
      }

      const productsBaseResponse: ProductsBaseResponse = await this.xml2jsService.parseXml<ProductsBaseResponse>(xmlData, 'parseResponseToProductBaseResponseDtoArray');
      return this.parseProductsResponseToProductResponseDtoArray(productsBaseResponse);
    } catch (error) {
      throw new Error(`parseResponseToProductBaseResponseDtoArray-ProductResponseService | ${error.message}`);
    }
  }
  
  async parseResponseToProductStorageGroupResponseDtoArray(soapResponse: string): Promise<ProductResponseDto[]> {    
    try {
      const soapBody = await this.xml2jsService.extractSoapBody(soapResponse);
      const xmlData: string = this.extractXmlProductsStorageGroupData(soapBody);
      
      if (xmlData === 'Not data found.') {
        return [];
      }

      const productsStorageGroupResponse: ProductsStorageGroupResponse = await this.xml2jsService.parseXml<ProductsStorageGroupResponse>(xmlData, 'parseResponseToProductStorageGroupResponseDtoArray');
      return this.parseProductsResponseToProductResponseDtoArray(productsStorageGroupResponse);
    } catch (error) {
      throw new Error(`parseResponseToProductStorageGroupResponseDtoArray-ProductResponseService | ${error.message}`);
    }
  }

  combineBaseAndStorageProducts(productsBaseDtos: ProductResponseDto[], productsStorageGroupDtos: ProductResponseDto[]): ProductResponseDto[] {
    try {
      const productsDuplicated: ProductResponseDto[] = [];
      const productsBaseUnique: ProductResponseDto[] = [];
      const productsStorageGroupUnique: ProductResponseDto[] = [];

      productsBaseDtos.forEach(productBase => {
        const matchingProduct = productsStorageGroupDtos.find(productStorageGroup => productStorageGroup.externalId === productBase.externalId);
        if (matchingProduct) {
          productsDuplicated.push({ ...matchingProduct });
        } else {
          productsBaseUnique.push({ ...productBase });
        }
      });

      productsStorageGroupDtos.forEach(productStorageGroup => {
        const matchingProduct = productsBaseDtos.find(productBase => productBase.externalId === productStorageGroup.externalId);
        if (!matchingProduct) {
          productsStorageGroupUnique.push({ ...productStorageGroup });
        }
      });

      this.logger.log(`Existen ${productsDuplicated.length} productos duplicados de ${productsBaseDtos.length + productsStorageGroupDtos.length}`);
      this.logger.log(`Existen ${productsBaseUnique.length} productos base únicos de ${productsBaseDtos.length}`);
      this.logger.log(`Existen ${productsStorageGroupUnique.length} productos storage group únicos de ${productsStorageGroupDtos.length}`);
  
      return [
        ...productsDuplicated,
        ...productsBaseUnique,
        ...productsStorageGroupUnique
      ];
    } catch (error) {
      throw new Error(`combineBaseAndStorageProducts-ProductResponseService | ${error.message}`);
    }
  }

  private parseProductsResponseToProductResponseDtoArray(productsResponse: ProductsBaseResponse | ProductsStorageGroupResponse): ProductResponseDto[] {
    if (!productsResponse || !productsResponse.NewDataSet || !productsResponse.NewDataSet.Table) {
      throw new Error(`parseProductsResponseToProductResponseDtoArray | Formato de datos incorrecto`);
    }

    return productsResponse.NewDataSet.Table
      .filter(item => item.stock !== '' && Number(item.stock) > 0)
      .map(item => ({
        externalId: item.item_id,
        name: item.item_desc,
        categoryId: item.cat_id,
        brandId: item.brand_id,
        factoryWarranty: item.item_guarantee,
        description: `${item.item_annotation} ${item.item_annotation1} ${item.item_annotation2}`,
        active: item.item_disabled === 'true',
        file: null,
        skus: [{
          eanCode: item.item_vendorCode,
          referenceCode: item.item_code,
          name: item.item_desc,
          sizeWidth: item.item_wide,
          sizeHeight: item.item_higth,
          sizeLength: item.item_large,
          volumen: item.item_wide * item.item_higth * item.item_large,
          weight: item.item_weight,
          active: item.item_disabled === 'true',
          stockInfinite: false,
          stockTotal: 0,
          stockCommited: 0,
          stockSecurity: 0,
          priceList: 0,
          priceCost: 0,
          files: null,
        }]
      }));
  }
 
  private extractXmlProductsBaseData(soapBody: any): string {
    const wsFullJaus_Item_funGetXMLDataResult: string = soapBody?.wsFullJaus_Item_funGetXMLDataResponse?.wsFullJaus_Item_funGetXMLDataResult;
    if (!wsFullJaus_Item_funGetXMLDataResult) {
      throw new Error(`extractXmlProductsBaseData | No se encontró wsFullJaus_Item_funGetXMLDataResult en el cuerpo SOAP`);
    }
    return wsFullJaus_Item_funGetXMLDataResult;
  }

  private extractXmlProductsStorageGroupData(soapBody: any): string {
    const item_funGetXMLDataByStorageGroupResult: string = soapBody?.Item_funGetXMLDataByStorageGroupResponse?.Item_funGetXMLDataByStorageGroupResult;
    if (!item_funGetXMLDataByStorageGroupResult) {
      throw new Error(`extractXmlProductsStorageGroupData | No se encontró Item_funGetXMLDataByStorageGroupResult en el cuerpo SOAP`);
    }
    return item_funGetXMLDataByStorageGroupResult;
  }
}