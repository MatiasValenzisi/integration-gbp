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
      if (this.isTokenActive()) {
        return this.token;
      }

      const soapBody: string = `<soap12:Body>
        <AuthenticateUser xmlns="http://microsoft.com/webservices/" />
      </soap12:Body>`;

      const soapResponse: string = await this.axiosService.sendSoapPostRequest('', soapBody);
      const token = await this.loginResponseService.parseResponseToToken(soapResponse);

      this.token = token;
      this.tokenExpiry = new Date(new Date().getTime() + 2 * 60 * 1000);
      this.logger.log(`Se ha obtenido un nuevo token: ${token}`);
      return token;
    } catch (error) {
      throw new InternalServerErrorException(`Error durante la autenticación: ${error.message}`);
    }
  }

  async getAllBrands(): Promise<BrandResponseDto[]> {
    try {
      const token = await this.authenticate();

      const soapBody: string = `<soap12:Body>
        <Branch_funGetXMLData xmlns="http://microsoft.com/webservices/" />
      </soap12:Body>`;

      const soapResponse: string = await this.axiosService.sendSoapPostRequest(token, soapBody);
      const parseResponseData: BrandResponseDto[] = await this.brandResponseService.parseResponseToBrandResponseDtoArray(soapResponse);
      return parseResponseData;
    } catch (error) {
      throw new InternalServerErrorException(`Error en getAllBrands: ${error.message}`);
    }
  }

  async getAllProductsBase(): Promise<ProductResponseDto[]> {
    try {
      const token = await this.authenticate();

      const soapBody: string = `<soap12:Body>
        <wsFullJaus_Item_funGetXMLData xmlns="http://microsoft.com/webservices/" />
      </soap12:Body>`;

      const soapResponse: string = await this.axiosService.sendSoapPostRequest(token, soapBody);
      const parseResponseData: ProductResponseDto[] = await this.productResponseService.parseResponseToProductBaseResponseDtoArray(soapResponse);
      this.logger.log(`Se ha obtenido en el metodo getAllProductsBase, ${parseResponseData.length} productos base`);
      return parseResponseData;
    } catch (error) {
      throw new InternalServerErrorException(`Error en getAllProductsBase: ${error.message}`);
    }
  }

  async getAllProductsStorageGroup(): Promise<ProductResponseDto[]> {
    try {
      const token = await this.authenticate();

      const soapBody: string = `<soap12:Body>
        <Item_funGetXMLDataByStorageGroup xmlns="http://microsoft.com/webservices/">
          <intCompId>${this.credentialService.companyId}</intCompId>
          <intStorId>${this.credentialService.storageGroup}</intStorId>
        </Item_funGetXMLDataByStorageGroup>
      </soap12:Body>`;

      const soapResponse: string = await this.axiosService.sendSoapPostRequest(token, soapBody);
      const parseResponseData: ProductResponseDto[] = await this.productResponseService.parseResponseToProductStorageGroupResponseDtoArray(soapResponse);
      this.logger.log(`Se ha obtenido en el metodo getAllProductsStorageGroup, ${parseResponseData.length} productos de grupo de almacenamiento`);
      return parseResponseData;
    } catch (error) {
      throw new InternalServerErrorException(`Error en getAllProductsStorageGroup: ${error.message}`);
    }
  }

  async getAllProductsCombined(): Promise<ProductResponseDto[]> {
    try {
      const productsBaseDtos: ProductResponseDto[] = await this.getAllProductsBase();
      const productsStorageGroupDtos: ProductResponseDto[] = await this.getAllProductsStorageGroup();
      const productsCombined: ProductResponseDto[] = this.productResponseService.combineBaseAndStorageProducts(productsBaseDtos, productsStorageGroupDtos);
      return productsCombined;
    } catch (error) {
      throw new InternalServerErrorException(`Error en getAllProductsCombined: ${error.message}`);
    }
  }

  async getAllProductsCombinedWithImages(): Promise<ProductResponseDto[]> {
    try {
      const productsBaseDtos: ProductResponseDto[] = await this.getAllProductsBase();
      const productsStorageGroupDtos: ProductResponseDto[] = await this.getAllProductsStorageGroup();
      const productsCombinedWithImages: ProductResponseDto[] = [];

      for (const productCombined of this.productResponseService.combineBaseAndStorageProducts(productsBaseDtos, productsStorageGroupDtos)) {
        const imageResponseDtos: ImageResponseDto[] = await this.loadImagesById(productCombined.externalId);
        const imageResponseDtoMain: ImageResponseDto = imageResponseDtos.find(item => item.order === -1);
        productCombined.file = imageResponseDtoMain;
        productCombined.skus[0].files = imageResponseDtos;
        productsCombinedWithImages.push(productCombined);
        this.logger.log(`Se ha cargado el producto combinado con imágenes número: ${productsCombinedWithImages.length}`);
      }

      return productsCombinedWithImages;
    } catch (error) {
      throw new InternalServerErrorException(`Error en getAllProductsCombinedWithImages: ${error.message}`);
    }
  }

  async loadImagesById(id: number): Promise<ImageResponseDto[]> {
    try {
      const token = await this.authenticate();

      const soapBody: string = `<soap12:Body>
        <ItemImages_funGetXMLData xmlns="http://microsoft.com/webservices/">
          <intItemId>${id}</intItemId>
        </ItemImages_funGetXMLData>
      </soap12:Body>`;

      const soapResponse: string = await this.axiosService.sendSoapPostRequest(token, soapBody);
      const parseResponseData: ImageResponseDto[] = await this.imageResponseService.parseResponseToImageResponseDtoArray(soapResponse);
      return parseResponseData;
    } catch (error) {
      throw new InternalServerErrorException(`Error en loadImagesById: ${error.message}`);
    }
  }

  private isTokenActive(): boolean {
    return !!this.token && !!this.tokenExpiry && new Date() < this.tokenExpiry;
  }
}
