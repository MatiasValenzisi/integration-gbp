import { Injectable } from '@nestjs/common';
import { AxiosService } from './axios.service';
import { Xml2jsService } from './xml2js.service';
import { CredentialService } from './credential.service';
import { LoginResponse } from '../interfaces/login-response.interface';
import { BrandItem } from '../interfaces/brand-Item.interface';
import * as uuidValidate from 'uuid-validate';

@Injectable()
export class NucleoService {
  
  constructor(
    private readonly credentialService: CredentialService,
    private readonly axiosService: AxiosService,
    private readonly xml2jsService: Xml2jsService
  ) {}

  async authenticate(): Promise<string> {    

    // Soap 1.2
    const soapRequestBody = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Header>
        <wsBasicQueryHeader xmlns="http://microsoft.com/webservices/">
          <pUsername>${this.credentialService.userName}</pUsername>
          <pPassword>${this.credentialService.password}</pPassword>
          <pCompany>${this.credentialService.company}</pCompany>
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
        throw new Error(`authenticate | Error al obtener el token | ${response}`);
      }

      return response;

    } catch (error) {
      throw new Error(`authenticate | Error en la solicitud de autenticación | ${error}`);
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
          <pCompany>${this.credentialService.company}</pCompany>
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
      return parseResponseData;

    } catch (error) {
      throw new Error(`getAllBrands | Error al obtener las marcas | ${error}`);
    }
  }

  async getAllProducts(): Promise<any> {

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
          <pCompany>${this.credentialService.company}</pCompany>
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
      return parseResponseData;

    } catch (error) {
      throw new Error(`getAllProducts - service | Error al obtener los productos | ${error.message} `);
    }
  }

  async getAllProductsPaginated(pagination: number, ): Promise<any> {

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
          <pCompany>${this.credentialService.company}</pCompany>
          <pWebService>${this.credentialService.webService}</pWebService>
          <pAuthenticatedToken>${token}</pAuthenticatedToken>
        </wsBasicQueryHeader>
      </soap12:Header>
      <soap12:Body>
        <wsFullJaus_Item_funGetXMLData_Paginated xmlns="http://microsoft.com/webservices/">
          <intPageNumber>1</intPageNumber>
          <intPageSize>50</intPageSize>
        </wsFullJaus_Item_funGetXMLData_Paginated>
      </soap12:Body>
    </soap12:Envelope>`;

    try {

      const soapAction: string = 'http://microsoft.com/webservices/wsFullJaus_Item_funGetXMLData_Paginated';
      const soapResponse = await this.axiosService.sendSoapPostRequest(soapRequestBody, soapAction);          
      // const parseResponseData = await this.xml2jsService.parseProductsPaginatedSoapResponse(soapResponse); 
      //return parseResponseData;

      console.log(soapResponse); // temporal.
      return null; // temporal.

    } catch (error) {
      throw new Error(`getAllProducts - service | Error al obtener los productos | ${error.message} `);
    }
  }

}
