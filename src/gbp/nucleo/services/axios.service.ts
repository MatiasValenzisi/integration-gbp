import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { CredentialService } from './credential.service';

@Injectable()
export class AxiosService {
  
  constructor(private credentialService: CredentialService) {}

  async sendRequest(method: Method, url: string, data: any = null, headers: any = {}, params: any = null): Promise<any> {
    
    try {      
      const config: AxiosRequestConfig = 
      { 
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

  async sendSoapPostRequest(soapRequestBody: string, soapAction: string): Promise<any> {
    const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': soapAction,
    };
    return this.sendRequest('POST', '', soapRequestBody, headers);
  }
}