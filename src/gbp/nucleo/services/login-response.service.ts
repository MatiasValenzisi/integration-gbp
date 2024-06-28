import { Injectable } from "@nestjs/common";
import * as uuidValidate from 'uuid-validate';
import { Xml2jsService } from "./xml2js.service";

@Injectable()
export class LoginResponseService {

  constructor(private readonly xml2jsService: Xml2jsService){}

  async parseResponseToToken(soapResponse: string): Promise<string> {    
    try {
      const soapBody = await this.xml2jsService.extractSoapBody(soapResponse);
      const token: string = this.extractXmlData(soapBody);
      if (!uuidValidate(token)) {
        throw new Error(`Error durante la autenticación: ${token}`);
      }
      return token;
    } catch (error) {
      throw new Error(`parseResponseToToken-LoginResponseService | ${error.message}`);
    }
  }

  private extractXmlData(soapBody: any): string {
    const authenticateUserResult = soapBody?.AuthenticateUserResponse?.AuthenticateUserResult;
    if (!authenticateUserResult) {
      throw new Error(`extractXmlData | No se encontró AuthenticateUserResult`);
    }
    return authenticateUserResult;
  }
}