import { Injectable } from "@nestjs/common";
import { Xml2jsService } from "./xml2js.service";
import { BrandResponseDto } from '../dto/brand-response.dto';
import { BrandsResponse } from "../interfaces/brands-response.interface";

@Injectable()
export class BrandResponseService {

  constructor(private readonly xml2jsService: Xml2jsService){}

  async parseResponseToBrandResponseDtoArray(soapResponse: string): Promise<BrandResponseDto[]> {    
    
    try {
      const soapBody = await this.xml2jsService.extractSoapBody(soapResponse);
      const xmlData: string = this.extractXmlData(soapBody);
      
      if (xmlData === 'Not data found.') {
        return [];
      }

      const brandsResponse: BrandsResponse = await this.xml2jsService.parseXml<BrandsResponse>(xmlData, 'parseResponseToBrandResponseDtoArray');
      const brandResponseDtoArray: BrandResponseDto[] = this.parseBrandsResponseToBrandResponseDtoArray(brandsResponse);
      return brandResponseDtoArray;

    } catch (error) {
      throw new Error(`parseResponseToBrandResponseDtoArray-BrandResponseService | ${error.message}`);
    }
  }
  
  private parseBrandsResponseToBrandResponseDtoArray(brandsResponse: BrandsResponse): BrandResponseDto[] {
    if (!brandsResponse || !brandsResponse.NewDataSet || !brandsResponse.NewDataSet.Table) {
      throw new Error(`parseBrandsResponseToBrandResponseDtoArray | Formato de datos incorrecto`);
    }

    return brandsResponse.NewDataSet.Table.map(item => ({
      externalId: item.bra_id,
      name: item.bra_desc,
      logo: null
    }));
  }
  
  private extractXmlData(soapBody: any): string {
    const branch_funGetXMLDataResult: string = soapBody?.Branch_funGetXMLDataResponse?.Branch_funGetXMLDataResult;
    if (!branch_funGetXMLDataResult) {
      throw new Error(`extractXmlData | No se encontró Branch_funGetXMLDataResult  en el cuerpo SOAP`);
    }
    return branch_funGetXMLDataResult;
  }
}
