import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { join } from "path";
import { promises as fsPromises } from "fs";
import { Xml2jsService } from "./xml2js.service";
import { ImagesResponse } from "../interfaces/images-response.interface";
import { ImageResponseDto } from "../dto/image-response.dto";

const { writeFile, mkdir } = fsPromises;

@Injectable()
export class ImageResponseService {

  constructor(private readonly xml2jsService: Xml2jsService) {}

  async parseResponseToImageResponseDtoArray(soapResponse: string): Promise<ImageResponseDto[]> {    
    try {
      const soapBody = await this.xml2jsService.extractSoapBody(soapResponse);
      const xmlData: string = this.extractXmlImagesData(soapBody);
      
      if (xmlData === 'Not data found.') {
        return [];
      }

      const imagesResponse: ImagesResponse = await this.xml2jsService.parseXml<ImagesResponse>(xmlData, 'parseResponseToImageResponseDtoArray');
      const imageResponseDtoArray: ImageResponseDto[] = await this.parseImageResponseToImageResponseDtoArray(imagesResponse);
      
      return imageResponseDtoArray;
    } catch (error) {
      throw new Error(`parseResponseToImageResponseDtoArray-ImageResponseService | ${error.message}`);
    }
  }

  private async parseImageResponseToImageResponseDtoArray(imagesResponse: ImagesResponse): Promise<ImageResponseDto[]> {
    if (!imagesResponse || !imagesResponse.NewDataSet || !imagesResponse.NewDataSet.Table) {
      throw new Error(`parseImageResponseToImageResponseDtoArray | Formato de datos incorrecto`);
    }
  
    try {
      const tableData = Array.isArray(imagesResponse.NewDataSet.Table)
        ? imagesResponse.NewDataSet.Table
        : [imagesResponse.NewDataSet.Table];
  
      const imageResponseDtos: Promise<ImageResponseDto>[] = tableData.map(async (item) => {
        const filePath = await this.saveImageInLocal(item.item_id, item.Order, item.item_picture);
        return {
          file: filePath,
          order: item.Order,
          productId: item.item_id,
        };
      });
  
      return Promise.all(imageResponseDtos);
      
    } catch (error) {
      throw new InternalServerErrorException(`parseImageResponseToImageResponseDtoArray | Error durante el parseo y guardado de imágenes: ${error.message}`);
    }
  }
  
  private async saveImageInLocal(id: number, order: number, base64: string): Promise<string> {
    try {
      const filename = `image_order_${order}.png`;
      const imagePath = join(__dirname, '..', '..', 'public', 'nucleo', 'image', id.toString(), filename); 
  
      // Verificar si el directorio 'public/nucleo/img' existe, si no, crearlo.
      await mkdir(join(__dirname, '..', '..', 'public', 'nucleo', 'image', id.toString()), { recursive: true });      
      await writeFile(imagePath, Buffer.from(base64, 'base64'));      
      return `www.url.s3.com/gbp/nucleo/image/${id}/${filename}`;
      
    } catch (error) {
      throw new Error(`saveImageInLocal | Error al guardar la imagen en local: ${error.message}`);
    }
  }

  private extractXmlImagesData(soapBody: any): string {
    const ItemImages_funGetXMLDataResult: string = soapBody?.ItemImages_funGetXMLDataResponse?.ItemImages_funGetXMLDataResult;
    if (!ItemImages_funGetXMLDataResult) {
      throw new Error(`extractXmlImageData | No se encontró ItemImages_funGetXMLDataResult en el cuerpo SOAP`);
    }
    return ItemImages_funGetXMLDataResult;
  }
}
