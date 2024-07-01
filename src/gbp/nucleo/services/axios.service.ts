import { Injectable } from '@nestjs/common';
import { Logger } from "nestjs-pino";
import axios, { AxiosRequestConfig, Method } from 'axios';
import { CredentialService } from './credential.service';

@Injectable()
export class AxiosService {

  constructor(private readonly logger: Logger, private credentialService: CredentialService) {}

  // Metodo para enviar una solicitud SOAP con reintentos opcionales.
  async sendSoapPostRequest(token: string, soapBody: string, retryIntervals: number[] = []): Promise<any> {
    return this.sendRequestWithRetry('POST', '', this.buildSoapRequestBody(token, soapBody), 
    { 'Content-Type': 'text/xml; charset=utf-8' }, null, retryIntervals);
  }

  // Metodo que construye el cuerpo de la solicitud SOAP.
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

  // Metodo para enviar una solicitud con reintentos.
  async sendRequestWithRetry(method: Method, url: string, data: any = null, headers: any = {}, params: any = null, retryIntervals: number[] = []): Promise<any> {
    let attempts = 0;
    const maxAttempts = retryIntervals.length + 1;

    while (attempts < maxAttempts) {
      try {
        const response = await this.sendRequest(method, url, data, headers, params);
        return response;
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          const delayMinutes = retryIntervals[attempts - 1] || 0;
          this.logger.warn(`sendRequestWithRetry - axios.service | ${error.message}`);
          this.logger.warn(`Se realizará el intento número: ${attempts} en ${delayMinutes} minutos...`);
          await this.delay(delayMinutes * 60 * 1000);
        } else {
          throw new Error(`sendRequestWithRetry - axios.service | Final Error after retries: ${error.message}`);
        }
      }
    }
  }

  // Método para enviar una solicitud utilizando axios.
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

  // Método para el delay de reintentos.
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
