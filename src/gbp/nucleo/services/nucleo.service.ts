import { Injectable } from '@nestjs/common';
import { AxiosService } from './axios.service';
import { Xml2jsService } from './xml2js.service';
import { CredentialService } from './credential.service';
import { LoginResponse } from '../interfaces/login-response.interface';
import { BrandItem } from '../interfaces/brand-item.interface';
import * as uuidValidate from 'uuid-validate';
import { ProductItem } from '../interfaces/product-Item.interface';
import { ProductStorageGroupItem } from '../interfaces/product-storage-group-item.interface';
import { ProductCombinedItem } from '../interfaces/product-combined-item.interface';
import { ProductStructuredItem } from '../interfaces/product-structured-item.interface';
import { ImageItem } from '../interfaces/image-item';

@Injectable()
export class NucleoService {

  private token: string;
  private tokenExpiry: Date;
  
  constructor(
    private readonly credentialService: CredentialService,
    private readonly axiosService: AxiosService,
    private readonly xml2jsService: Xml2jsService
  ) {}

  async authenticate(): Promise<string> {   
    
    if (this.token && new Date() < this.tokenExpiry) {
      return this.token;
    }

    // Soap 1.2
    const soapRequestBody = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Header>
        <wsBasicQueryHeader xmlns="http://microsoft.com/webservices/">
          <pUsername>${this.credentialService.userName}</pUsername>
          <pPassword>${this.credentialService.password}</pPassword>
          <pCompany>${this.credentialService.companyId}</pCompany>
          <pWebWervice>${this.credentialService.webService}</pWebWervice>
          <pAuthenticatedToken>${this.credentialService.authenticatedToken}</pAuthenticatedToken>
        </wsBasicQueryHeader>
      </soap12:Header>
      <soap12:Body>
        <AuthenticateUser xmlns="http://microsoft.com/webservices/" />
      </soap12:Body>
    </soap12:Envelope>`;

    try {
      const soapAction: string = 'http://microsoft.com/webservices/AuthenticateUser';
      const soapResponse = await this.axiosService.sendSoapPostRequest(soapRequestBody, soapAction);
      const jsonResponse: LoginResponse = await this.xml2jsService.xmlToObjectLoginResponse(soapResponse);
      const response: string = jsonResponse["soap:Envelope"]["soap:Body"]["AuthenticateUserResponse"]["AuthenticateUserResult"];
      
      if (!uuidValidate(response)){
        throw new Error(`uuidValidate | authenticate - service | ${response}`);
      }

      // Actualizar el atributo token del servicio.
      this.token = response;
      this.tokenExpiry = new Date(new Date().getTime() + 2 * 60 * 1000); // token es valido por dos minutos.

      return response;

    } catch (error) {
      throw new Error(`authenticate - service | ${error}`);
    }
  }

  async getAllBrands(): Promise<BrandItem[]> {

    const token = await this.authenticate();

    // Soap 1.2
    const soapRequestBody = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Header>
        <wsBasicQueryHeader xmlns="http://microsoft.com/webservices/">
          <pUsername>${this.credentialService.userName}</pUsername>
          <pPassword>${this.credentialService.password}</pPassword>
          <pCompany>${this.credentialService.companyId}</pCompany>
          <pWebWervice>${this.credentialService.webService}</pWebWervice>
          <pAuthenticatedToken>${token}</pAuthenticatedToken>
        </wsBasicQueryHeader>
      </soap12:Header>
      <soap12:Body>
        <Branch_funGetXMLData xmlns="http://microsoft.com/webservices/" />
      </soap12:Body>
    </soap12:Envelope>`;

    try {

      const soapAction: string = 'http://microsoft.com/webservices/Brand_funGetXMLData';
      const soapResponse = await this.axiosService.sendSoapPostRequest(soapRequestBody, soapAction);      
      const parseResponseData = await this.xml2jsService.parseBrandsSoapResponse(soapResponse);
      console.log(`Se ha obtenido en [getAllBrands], ${parseResponseData.length} marcas.`);
      return parseResponseData;

    } catch (error) {
      throw new Error(`getAllBrands | ${error}`);
    }
  }

  async getAllProducts(): Promise<ProductItem[]> {

    const token: string = await this.authenticate();

    // Soap 1.2
    const soapRequestBody = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Header>
        <wsBasicQueryHeader xmlns="http://microsoft.com/webservices/">
          <pUsername>${this.credentialService.userName}</pUsername>
          <pPassword>${this.credentialService.password}</pPassword>
          <pCompany>${this.credentialService.companyId}</pCompany>
          <pWebWervice>${this.credentialService.webService}</pWebWervice>
          <pAuthenticatedToken>${token}</pAuthenticatedToken>
        </wsBasicQueryHeader>
      </soap12:Header>
      <soap12:Body>
        <wsFullJaus_Item_funGetXMLData xmlns="http://microsoft.com/webservices/" />
      </soap12:Body>
    </soap12:Envelope>`;

    try {

      const soapAction: string = 'http://microsoft.com/webservices/wsFullJaus_Item_funGetXMLData';
      const soapResponse = await this.axiosService.sendSoapPostRequest(soapRequestBody, soapAction);          
      const parseResponseData = await this.xml2jsService.parseProductsSoapResponse(soapResponse);
      console.log(`Se ha obtenido en [getAllProducts], ${parseResponseData.length} productos.`);
      return parseResponseData;

    } catch (error) {
      throw new Error(`getAllProducts - service | ${error.message} `);
    }
  }

  async getAllProductsStorageGroup(): Promise<ProductStorageGroupItem[]> {

    const token: string = await this.authenticate();

    // Soap 1.2
    const soapRequestBody = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Header>
        <wsBasicQueryHeader xmlns="http://microsoft.com/webservices/">
          <pUsername>${this.credentialService.userName}</pUsername>
          <pPassword>${this.credentialService.password}</pPassword>
          <pCompany>${this.credentialService.companyId}</pCompany>
          <pWebWervice>${this.credentialService.webService}</pWebWervice>
          <pAuthenticatedToken>${token}</pAuthenticatedToken>
        </wsBasicQueryHeader>
      </soap12:Header>
      <soap12:Body>
        <Item_funGetXMLDataByStorageGroup xmlns="http://microsoft.com/webservices/">
          <intCompId>${this.credentialService.companyId}</intCompId>
          <intStorId>${this.credentialService.storageGroup}</intStorId>
        </Item_funGetXMLDataByStorageGroup>
      </soap12:Body>
    </soap12:Envelope>`;

    try {

      const soapAction: string = 'http://microsoft.com/webservices/Item_funGetXMLDataByStorageGroup';
      const soapResponse = await this.axiosService.sendSoapPostRequest(soapRequestBody, soapAction);        
      const parseResponseData = await this.xml2jsService.parseProductsStorageGroupSoapResponse(soapResponse);
      console.log(`Se ha obtenido en [getAllProductsStorageGroup], ${parseResponseData.length} productos.`);
      return parseResponseData;

    } catch (error) {
      throw new Error(`getAllProductsStorageGroup - service | ${error.message} `);
    }
  }

  async getUpdatedProductsInStock(): Promise<ProductCombinedItem[]> {
    try {      
      const updatedProducts: ProductCombinedItem[] = await this.combineAndUpdatetAllProducts();
      const stockedProducts: ProductCombinedItem[] = this.getStockedProducts(updatedProducts);
      return stockedProducts;
    } catch (error) {
      throw new Error(`getUpdatedProductsInStock - service | ${error.message} `); 
    }
  }

  private async combineAndUpdatetAllProducts(): Promise<ProductCombinedItem[]> {
    
    try {
      const products: ProductItem[] = await this.getAllProducts();
      const productsStorageGroup: ProductStorageGroupItem[] = await this.getAllProductsStorageGroup();
  
      const updatedProducts: ProductCombinedItem[] = products.map(product => {
        const matchingProduct: ProductStorageGroupItem = productsStorageGroup.find(storageProduct => storageProduct.item_id == product.item_id);
        if (matchingProduct) {
          return { ...matchingProduct, PhisicalStock: matchingProduct.PhisicalStock, option_id: matchingProduct.option_id, item_volume: product.item_volume };
        } else {
          return { ...product, PhisicalStock: "", option_id: "", item_volume: product.item_volume };
        }
      });
  
      const nonMatchingProducts = productsStorageGroup.filter(storageProduct => !products.some(product => product.item_id === storageProduct.item_id))
        .map(storageProduct => ({
          ...storageProduct,
          PhisicalStock: storageProduct.PhisicalStock,
          option_id: storageProduct.option_id,
          item_volume: "",
        }));
  
      const finalProducts = [...updatedProducts, ...nonMatchingProducts];  

      console.log(`Se ha obtenido en [combineAndUpdatetAllProducts], ${finalProducts.length} productos.`);

      return finalProducts;
  
    } catch (error) {
      throw new Error(`combineAndUpdatetAllProducts - service | ${error.message}`);
    }
  }

  private getStockedProducts(products: ProductCombinedItem[]): ProductCombinedItem[] {
    const stockedProducts: ProductCombinedItem[] = products.filter(product => {
      return product.stock !== "" && Number(product.stock) !== 0
    });
    return stockedProducts;
  }

  async getImagesByProductId(id: Number): Promise<ImageItem[]> {

    const token: string = await this.authenticate(); // temporal (ver como utilizarlo);

    // Soap 1.2
    const soapRequestBody = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Header>
        <wsBasicQueryHeader xmlns="http://microsoft.com/webservices/">
          <pUsername>${this.credentialService.userName}</pUsername>
          <pPassword>${this.credentialService.password}</pPassword>
          <pCompany>${this.credentialService.companyId}</pCompany>
          <pWebWervice>${this.credentialService.webService}</pWebWervice>
          <pAuthenticatedToken>${token}</pAuthenticatedToken>
        </wsBasicQueryHeader>
      </soap12:Header>
      <soap12:Body>
        <ItemImages_funGetXMLData xmlns="http://microsoft.com/webservices/">
          <intItemId>${id}</intItemId>
        </ItemImages_funGetXMLData>
      </soap12:Body>
    </soap12:Envelope>`;

    try {

      const soapAction: string = 'http://microsoft.com/webservices/ItemImages_funGetXMLData';
      const soapResponse = await this.axiosService.sendSoapPostRequest(soapRequestBody, soapAction);        
      const parseResponseData = await this.xml2jsService.parseImagesSoapResponse(soapResponse);
       
      return parseResponseData;

    } catch (error) {
      throw new Error(`getImagesByProductId - service | ${error.message} `);
    }
  }

  async getProductsStructuredWithImages(): Promise<ProductStructuredItem[]> {

    try {
      
      const products: ProductCombinedItem[] = await this.getUpdatedProductsInStock();    
      //const limitedProducts = products.slice(0, 5000);
      const productsStructured = [];

      try {      
  
        for (const product of products) {    
          const imagesProduct:ImageItem[] = await this.getImagesByProductId(Number(product.item_id));
          const productStructuredItem: ProductStructuredItem = this.xml2jsService.parseProductStructuredItem(product, imagesProduct);
          productsStructured.push(productStructuredItem);
          console.log(`Se ha cargado el producto estructurado N°${productsStructured.length}.`);
        }
        return productsStructured;
      
      } catch (error) {  
        console.log(`Se ha obtenido en [getImagesByProductId], ${productsStructured.length} productos.`);
        throw new Error(`getProductsStructuredWithImages - service | getImagesByProductId | ${error.message} `);
      }
      
    } catch (error) {
      throw new Error(`getProductsStructuredWithImages - service | getUpdatedProductsInStock | ${error.message} `);
    }  
  }  
}