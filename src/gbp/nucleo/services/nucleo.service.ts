import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AxiosService } from './axios.service';
import { LoginResponseService } from './login-response.service';
import { BrandResponseService } from './brand-response.service';
import { ProductResponseService } from './product-response.service';
import { CredentialService } from './credential.service';
import { BrandResponseDto } from '../dto/brand-response.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ImageResponseDto } from '../dto/image-response.dto';
import { ImageResponseService } from './image-response.service';

@Injectable()
export class NucleoService {

  private token: string;
  private tokenExpiry: Date;
  
  constructor(
    private readonly logger: Logger,
    private readonly axiosService: AxiosService,
    private readonly credentialService: CredentialService,
    private readonly loginResponseService: LoginResponseService,
    private readonly brandResponseService: BrandResponseService,
    private readonly productResponseService: ProductResponseService,
    private readonly imageResponseService: ImageResponseService
  ) {}

  async authenticate(): Promise<string> {   
    
    try {

      // Verifica si ya hay un token almacenado.
      if (this.isTokenActive()){
        return this.token;
      }

      const soapBody: string = `<soap12:Body>
        <AuthenticateUser xmlns="http://microsoft.com/webservices/" />
      </soap12:Body>`;

      const soapResponse: string = await this.axiosService.sendSoapPostRequest('', soapBody);
      const token = await this.loginResponseService.parseResponseToToken(soapResponse);
      
      // Actualizar el token y su fecha de expiración. El token válido por 2 minutos.
      this.token = token;      
      this.tokenExpiry = new Date(new Date().getTime() + 2 * 60 * 1000);
      this.logger.log(`Se ha obtenido un nuevo token: ${token}`);
      return token;
      
    } catch (error) {
      throw new InternalServerErrorException(`Error durante la autenticación: ${error.message}`);
    }    
  }

  async getAllBrands(): Promise<BrandResponseDto[]> {  

    const token = await this.authenticate();

    const soapBody: string = `<soap12:Body>
      <Branch_funGetXMLData xmlns="http://microsoft.com/webservices/" />
    </soap12:Body>`;

    const soapResponse: string = await this.axiosService.sendSoapPostRequest(token, soapBody);
    const parseResponseData: BrandResponseDto[] = await this.brandResponseService.parseResponseToBrandResponseDtoArray(soapResponse);     
    return parseResponseData;
  }

  async getAllProductsBase(): Promise<ProductResponseDto[]> {  

    const token = await this.authenticate();

    const soapBody: string = `<soap12:Body>
        <wsFullJaus_Item_funGetXMLData xmlns="http://microsoft.com/webservices/" />
      </soap12:Body>`;          

    const retryIntervals: number[] = [5, 15, 20];
    const soapResponse: string = await this.axiosService.sendSoapPostRequest(token, soapBody, retryIntervals);
    const parseResponseData: ProductResponseDto[] = await this.productResponseService.parseResponseToProductBaseResponseDtoArray(soapResponse);    
    this.logger.log(`Se ha obtenido en el metodo getAllProductsBase, ${parseResponseData.length} productos base`);
    return parseResponseData;
  }

  async getAllProductsStorageGroup(): Promise<ProductResponseDto[]> {  

    const token = await this.authenticate();

    const soapBody: string = `<soap12:Body>
        <Item_funGetXMLDataByStorageGroup xmlns="http://microsoft.com/webservices/">
          <intCompId>${this.credentialService.companyId}</intCompId>
          <intStorId>${this.credentialService.storageGroup}</intStorId>
        </Item_funGetXMLDataByStorageGroup>
      </soap12:Body>`;  

    const retryIntervals: number[] = [5, 15, 20];
    const soapResponse: string = await this.axiosService.sendSoapPostRequest(token, soapBody, retryIntervals);
    const parseResponseData: ProductResponseDto[] = await this.productResponseService.parseResponseToProductStorageGroupResponseDtoArray(soapResponse);
    this.logger.log(`Se ha obtenido en el metodo getAllProductsStorageGroup, ${parseResponseData.length} productos de grupo de almacenamiento`);
    return parseResponseData;
  }

  async getAllProductsCombined(): Promise<ProductResponseDto[]> {

    const productsBaseDtos: ProductResponseDto[] = await this.getAllProductsBase();
    const productsStorageGroupDtos: ProductResponseDto[] = await this.getAllProductsStorageGroup();
    const productsCombined: ProductResponseDto[] = this.productResponseService.combineBaseAndStorageProducts(productsBaseDtos, productsStorageGroupDtos);
    return productsCombined;
  }

  async loadImagesById(id: number): Promise<ImageResponseDto[]> {
    
    const token = await this.authenticate();

    const soapBody: string = `<soap12:Body>
        <ItemImages_funGetXMLData xmlns="http://microsoft.com/webservices/">
          <intItemId>${id}</intItemId>
        </ItemImages_funGetXMLData>
      </soap12:Body>`;  

    const soapResponse: string = await this.axiosService.sendSoapPostRequest(token, soapBody);
    const parseResponseData: ImageResponseDto[] = await this.imageResponseService.parseResponseToImageResponseDtoArray(soapResponse);    
    return parseResponseData;
  }

  async getAllProductsCombinedWithImages(): Promise<ProductResponseDto[]> {

    const productsBaseDtos: ProductResponseDto[] = await this.getAllProductsBase();
    const productsStorageGroupDtos: ProductResponseDto[] = await this.getAllProductsStorageGroup();
    const productsCombinedWithImages: ProductResponseDto[] = [];
    const productsCombined: ProductResponseDto[] = this.productResponseService.combineBaseAndStorageProducts(productsBaseDtos, productsStorageGroupDtos);
    
    // TODO: Cantidad de productos combinados a los que se le busca la imagen.
    const limitedproductsCombined = productsCombined.slice(0, 1500);
    
    for (const productCombined of limitedproductsCombined) {    
      const imageResponseDtos: ImageResponseDto[] = await this.loadImagesById(productCombined.externalId);
      const imageResponseDtoMain: ImageResponseDto = imageResponseDtos.find(item => item.order == -1);
      productCombined.file = imageResponseDtoMain;
      productCombined.skus[0].files = imageResponseDtos;
      productsCombinedWithImages.push(productCombined);     
      this.logger.log(`Se ha cargado el producto combinado con imagenes número: ${productsCombinedWithImages.length}`);
    }
    return productsCombinedWithImages;
  }

  // Valida si el token esta activo o se vencio.
  private isTokenActive(): boolean {
    return !!this.token && !!this.tokenExpiry && new Date() < this.tokenExpiry;
  }
}