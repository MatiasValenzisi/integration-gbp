import { Injectable } from '@nestjs/common';
import { parseString, ParserOptions } from 'xml2js';

@Injectable()
export class Xml2jsService {
  
  private parserOptions: ParserOptions = {
    explicitArray: false,
    ignoreAttrs: true,
  };

  async extractSoapBody(soapResponse: string): Promise<any> {
    
    const result = await this.parseXml<any>(soapResponse, 'extractSoapBody');
    const soapEnvelope = result['soap:Envelope'];
    
    if (!soapEnvelope) {
      throw new Error(`extractSoapBody | Formato de respuesta SOAP incorrecto`);
    }
    
    const soapBody = soapEnvelope['soap:Body'];    
    if (!soapBody || Object.keys(soapBody).length == 0) {
      throw new Error(`extractSoapBody | Formato de respuesta SOAP incorrecto`);
    }
    
    return soapBody;
  }
  
  parseXml<T>(xml: string, methodName: string): Promise<T> {
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
}