import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { parseString, ParserOptions } from 'xml2js';

@Injectable()
export class Xml2jsService {
  
  private readonly logger: Logger;
  
  private readonly parserOptions: ParserOptions = {
    explicitArray: false,
    ignoreAttrs: true,
  };

  async extractSoapBody(soapResponse: string): Promise<any> {
    try {
      const result = await this.parseXml<any>(soapResponse, 'extractSoapBody');
      const soapEnvelope = result['soap:Envelope'];
  
      if (!soapEnvelope) {
        throw new Error(`Formato de respuesta SOAP: (soap:Envelope) incorrecto`);
      }
      
      const soapBody = soapEnvelope['soap:Body'];    
      if (!soapBody || Object.keys(soapBody).length === 0) {
        throw new Error(`Formato de respuesta SOAP (soap:Body) incorrecto`);
      }
      
      return soapBody;
    } catch (error) {
      this.logger.error(`Error en extractSoapBody: ${error.message}`);
      throw new Error(`Error al extraer el cuerpo SOAP: ${error.message}`);
    }
  }
  
  parseXml<T>(xml: string, methodName: string): Promise<T> {
    return new Promise((resolve, reject) => {
      parseString(xml, this.parserOptions, (err, result) => {
        if (err) {
          reject(new Error(`Error al parsear el XML (${xml}) en ${methodName}: ${err.message}`));
        } else {
          resolve(result as T);
        }
      });
    });
  }
}