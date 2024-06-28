import { Injectable } from "@nestjs/common";
import { Xml2jsService } from "./xml2js.service";
import { ProductsBaseResponse } from "../interfaces/products-base-response.interface";
import { ProductsStorageGroupResponse } from "../interfaces/product-storage-group-response.interface";
import { ProductResponseDto } from "../dto/product-response.dto";
import { ImageResponseDto } from '../dto/image-response.dto';
import { ImagesResponse } from "../interfaces/images-response.interface";

@Injectable()
export class ProductResponseService {

  constructor(private readonly xml2jsService: Xml2jsService){}

  async parseResponseToProductBaseResponseDtoArray(soapResponse: string): Promise<ProductResponseDto[]> {    
    
    try {
      const soapBody = await this.xml2jsService.extractSoapBody(soapResponse);
      const xmlData: string = this.extractXmlProductsBaseData(soapBody);
      
      if (xmlData == 'Not data found.'){
        return [];
      }

      const productsBaseResponse: ProductsBaseResponse = await this.xml2jsService.parseXml<ProductsBaseResponse>(xmlData, 'parseResponseToProductBaseResponseDtoArray');
      const productBaseResponseDtoArray: ProductResponseDto[] = this.parseProductsBaseResponseToProductBaseResponseDtoArray(productsBaseResponse);
      return productBaseResponseDtoArray;

    } catch (error) {
      throw new Error(`parseResponseToBrandResponseDtoArray-ProductResponseService | ${error.message}`);
    }
  }
  
  async parseResponseToProductStorageGroupResponseDtoArray(soapResponse: string): Promise<ProductResponseDto[]> {    
    
    try {
      const soapBody = await this.xml2jsService.extractSoapBody(soapResponse);
      const xmlData: string = this.extractXmlProductsStorageGroupData(soapBody);
      
      if (xmlData == 'Not data found.'){
        return [];
      }

      const productsStorageGroupResponse: ProductsStorageGroupResponse = await this.xml2jsService.parseXml<ProductsStorageGroupResponse>(xmlData, 'parseResponseToProductStorageGroupResponseDtoArray');
      const productStorageGroupResponseDtoArray: ProductResponseDto[] = this.parseProductsStorageGroupResponseToProductStorageGroupResponseDtoArray(productsStorageGroupResponse);
      return productStorageGroupResponseDtoArray;

    } catch (error) {
      throw new Error(`parseResponseToBrandResponseDtoArray-ProductResponseService | ${error.message}`);
    }
  }

  combineBaseAndStorageProducts(productsBaseDtos: ProductResponseDto[], productsStorageGroupDtos: ProductResponseDto[]): ProductResponseDto[] {
    
    try {

      const productsDuplicated: ProductResponseDto[] = [];
      const productsBaseUnique: ProductResponseDto[] = [];
      const productsStorageGroupUnique: ProductResponseDto[] = [];

      productsBaseDtos.forEach(productBase => {
        const matchingProduct: ProductResponseDto = productsStorageGroupDtos.find(productStorageGroup => productStorageGroup.externalId == productBase.externalId);
        if (matchingProduct) {
          productsDuplicated.push({ ...matchingProduct });
        } else {
          productsBaseUnique.push({ ...productBase });
        }
      });

      productsStorageGroupDtos.forEach(productStorageGroup => {
        const matchingProduct: ProductResponseDto = productsBaseDtos.find(productBase => productBase.externalId == productStorageGroup.externalId);
        if(!matchingProduct){
          productsStorageGroupUnique.push({ ...productStorageGroup });
        }
      });

      console.log(`Existen ${productsDuplicated.length} productos duplicados`);
      console.log(`Existen ${productsBaseUnique.length} productos base unicos`);
      console.log(`Existen ${productsStorageGroupUnique.length} productos storage group unicos`);

      const productCombinedDtoArray: ProductResponseDto[] = [
        ...productsDuplicated,
        ...productsBaseUnique,
        ...productsStorageGroupUnique
      ];
  
      return productCombinedDtoArray;

    } catch (error) {
      throw new Error(`combineBaseAndStorageProducts-ProductResponseService | ${error.message}`);
    }
  }

  async parseResponseToImageResponseDtoArray(soapResponse: string): Promise<ImageResponseDto[]> {    
    
    try {
      const soapBody = await this.xml2jsService.extractSoapBody(soapResponse);
      const xmlData: string = this.extractXmlImagespData(soapBody);
      
      if (xmlData == 'Not data found.'){
        return [];
      }

      const imagesResponse: ImagesResponse = await this.xml2jsService.parseXml<ImagesResponse>(xmlData, 'parseResponseToImageResponseDtoArray');
      const imageResponseDtoArray: ImageResponseDto[] = this.parseImageResponseToImageResponseDtoArray(imagesResponse);
      return imageResponseDtoArray;

    } catch (error) {
      throw new Error(`parseResponseToImageResponseDto-ProductResponseService | ${error.message}`);
    }
  }

  addImagesProductCombined(productCombined: ProductResponseDto): ProductResponseDto {

    //   const limitedProducts = productsCombined.slice(0, 50); // Obtener las imagenes de los primeras 50 productos.

    //   const imagesProduct:ImageResponseDto[] = await this.getImagesByProductId(Number(product.item_id));


    //   const productsCombinedWithImages = [];

    // return productsCombinedWithImages;

    return null

  }

  private parseProductsBaseResponseToProductBaseResponseDtoArray(productsBaseResponse: ProductsBaseResponse): ProductResponseDto[]{

    if (!productsBaseResponse || !productsBaseResponse.NewDataSet || !productsBaseResponse.NewDataSet.Table) {
      throw new Error(`parseProductsBaseResponseToProductBaseResponseDtoArray | Formato de datos incorrecto`);
    }

    const productBaseResponseDtos: ProductResponseDto[] = productsBaseResponse.NewDataSet.Table
    .filter(item => item.stock != "" && Number(item.stock) > 0) // Unicamente se traen los productos con stock.
    .map(item => ({
      externalId: Number(item.item_id),
      name: item.item_desc,
      categoryId: item.cat_id,
      brandId: item.brand_id,
      factoryWarranty: item.item_guarantee,
      description: `${item.item_annotation} ${item.item_annotation1} ${item.item_annotation2}`,
      active: (item.item_disabled == "true"),
      file: null,
      skus: [{
        eanCode: item.item_vendorCode,
        referenceCode: item.item_code,
        name: item.item_desc,
        sizeWidth: Number(item.item_wide),
        sizeHeight: Number(item.item_higth),
        sizeLength: Number(item.item_large),
        volumen: Number(item.item_volume),
        weight: Number(item.item_weight),
        active: (item.item_disabled == "true"),
        stockInfinite: false,
        stockTotal: 0,
        stockCommited: 0,
        stockSecurity: 0,
        priceList: 0,
        priceCost: 0,
        files: null,
      }]
    }));

    return productBaseResponseDtos;
  }

  private parseProductsStorageGroupResponseToProductStorageGroupResponseDtoArray(productsStorageGroupResponse: ProductsStorageGroupResponse): ProductResponseDto[]{

    if (!productsStorageGroupResponse || !productsStorageGroupResponse.NewDataSet || !productsStorageGroupResponse.NewDataSet.Table) {
      throw new Error(`parseProductsStorageGroupResponseToProductStorageGroupResponseDtoArray | Formato de datos incorrecto`);
    }

    const productStorageGroupResponseDtos: ProductResponseDto[] = productsStorageGroupResponse.NewDataSet.Table
    .filter(item => item.stock != "" && Number(item.stock) > 0) // Unicamente se traen los productos con stock.
    .map(item => ({
      externalId: Number(item.item_id),
      name: item.item_desc,
      categoryId: item.cat_id,
      brandId: item.brand_id,
      factoryWarranty: item.item_guarantee,
      description: `${item.item_annotation} ${item.item_annotation1} ${item.item_annotation2}`,
      active: (item.item_disabled == "true"),
      file: null,
      skus: [{
        eanCode: item.item_vendorCode,
        referenceCode: item.item_code,
        name: item.item_desc,
        sizeWidth: Number(item.item_wide),
        sizeHeight: Number(item.item_higth),
        sizeLength: Number(item.item_large),
        volumen: Number(item.item_wide)*Number(item.item_higth)*Number(item.item_large), // Ya que no viene el valor en la consulta, se calcula.
        weight: Number(item.item_weight),
        active: (item.item_disabled == "true"),
        stockInfinite: false,
        stockTotal: 0,
        stockCommited: 0,
        stockSecurity: 0,
        priceList: 0,
        priceCost: 0,
        files: null
      }]
    }));

    return productStorageGroupResponseDtos;
  }

  private parseImageResponseToImageResponseDtoArray(imagesResponse: ImagesResponse): ImageResponseDto[]{

    if (!imagesResponse || !imagesResponse.NewDataSet || !imagesResponse.NewDataSet.Table) {
      throw new Error(`parseImageResponseToImageResponseDtoArray | Formato de datos incorrecto`);
    }

    // Si viene una sola imagen, la trata como un array de igual manera.
    const tableData = Array.isArray(imagesResponse.NewDataSet.Table)
    ? imagesResponse.NewDataSet.Table
    : [imagesResponse.NewDataSet.Table];

    const imageResponseDtos: ImageResponseDto[] = tableData.map(item => ({
      file: `www.simulacion.url.s3.com/${item.item_id}_order_${item.Order}`,
      order: Number(item.Order),
      productId: item.item_id,
    }));
    return imageResponseDtos;
  }
  
  private extractXmlProductsBaseData(soapBody: any): string {
    const wsFullJaus_Item_funGetXMLDataResult: string = soapBody?.wsFullJaus_Item_funGetXMLDataResponse?.wsFullJaus_Item_funGetXMLDataResult;
    if (!wsFullJaus_Item_funGetXMLDataResult) {
      throw new Error(`extractXmlData | No se encontró wsFullJaus_Item_funGetXMLDataResult`);
    }
    return wsFullJaus_Item_funGetXMLDataResult;
  }

  private extractXmlProductsStorageGroupData(soapBody: any): string {
    const item_funGetXMLDataByStorageGroupResult: string = soapBody?.Item_funGetXMLDataByStorageGroupResponse?.Item_funGetXMLDataByStorageGroupResult;
    if (!item_funGetXMLDataByStorageGroupResult) {
      throw new Error(`extractXmlData | No se encontró Item_funGetXMLDataByStorageGroupResult`);
    }
    return item_funGetXMLDataByStorageGroupResult;
  }

  private extractXmlImagespData(soapBody: any): string {
    const ItemImages_funGetXMLDataResult: string = soapBody?.ItemImages_funGetXMLDataResponse?.ItemImages_funGetXMLDataResult;
    if (!ItemImages_funGetXMLDataResult) {
      throw new Error(`extractXmlImageData | No se encontró ItemImages_funGetXMLDataResult en el cuerpo SOAP`);
    }
    return ItemImages_funGetXMLDataResult;
  }  
}