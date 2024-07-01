import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { CredentialService } from './credential.service';

@Injectable()
export class AxiosService {
  
  constructor(private credentialService: CredentialService) {}

  async sendSoapPostRequest(token: string, soapBody: string): Promise<any> {
    const headers = { 'Content-Type': 'text/xml; charset=utf-8' };
    const requestBody = this.buildSoapRequestBody(token, soapBody);
    return this.sendRequest('POST', '', requestBody, headers);
  }

  buildSoapRequestBody(token: string, soapBody: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
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
        ${soapBody}
      </soap12:Envelope>`;
  }

  async sendRequest(method: Method, url: string, data: any = null, headers: any = {}, params: any = null): Promise<any> {
    try {      
      const config: AxiosRequestConfig = { 
        method, 
        url: `${this.credentialService.baseUrl}${url}`, 
        headers, 
        data, 
        params,
      };

      const response = await axios(config);
      return response.data;

    } catch (error) {
      throw new Error(`sendRequest - axios.service | Error: ${error.message}`);
    }
  }

}