import { Controller, Get, HttpCode, HttpStatus, Param, Post, InternalServerErrorException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { NucleoService } from './services/nucleo.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ImageResponseDto } from './dto/image-response.dto';

@Controller('nucleo')
export class NucleoController {

  constructor(private readonly logger: Logger, private readonly nucleoService: NucleoService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(): Promise<LoginResponseDto> {
    try {
      const token: string = await this.nucleoService.authenticate();
      return { token };
    } catch (error) {
      this.logger.error(`Error en login: ${error.message}`);
      throw new InternalServerErrorException('Error al autenticar');
    }
  }

  @Get('brands')
  @HttpCode(HttpStatus.OK)
  async getAllBrands(): Promise<BrandResponseDto[]> {
    try {
      return await this.nucleoService.getAllBrands();
    } catch (error) {
      this.logger.error(`Error en getAllBrands: ${error.message}`);
      throw new InternalServerErrorException('Error al obtener marcas');
    }
  }

  @Get('products/base')
  @HttpCode(HttpStatus.OK)
  async getAllProductsBase(): Promise<ProductResponseDto[]> {
    try {
      return await this.nucleoService.getAllProductsBase();
    } catch (error) {
      this.logger.error(`Error en getAllProductsBase: ${error.message}`);
      throw new InternalServerErrorException('Error al obtener productos base');
    }
  }

  @Get('products/storage/group')
  @HttpCode(HttpStatus.OK)
  async getAllProductsStorageGroup(): Promise<ProductResponseDto[]> {
    try {
      return await this.nucleoService.getAllProductsStorageGroup();
    } catch (error) {
      this.logger.error(`Error en getAllProductsStorageGroup: ${error.message}`);
      throw new InternalServerErrorException('Error al obtener productos por grupo de almacenamiento');
    }
  }

  @Get('products/combined')
  @HttpCode(HttpStatus.OK)
  async getAllProductsCombined(): Promise<ProductResponseDto[]> {
    try {
      return await this.nucleoService.getAllProductsCombined();
    } catch (error) {
      this.logger.error(`Error en getAllProductsCombined: ${error.message}`);
      throw new InternalServerErrorException('Error al obtener productos combinados');
    }
  }

  @Get('product/images/load/:id')
  @HttpCode(HttpStatus.OK)
  async loadImagesById(@Param('id') id: number): Promise<ImageResponseDto[]> {
    try {
      return await this.nucleoService.loadImagesById(id);
    } catch (error) {
      this.logger.error(`Error en loadImagesById: ${error.message}`);
      throw new InternalServerErrorException('Error al cargar imágenes por ID');
    }
  }

  @Get('products/combined/withimages')
  @HttpCode(HttpStatus.OK)
  async getAllProductsCombinedWithImages(): Promise<ProductResponseDto[]> {
    try {
      return await this.nucleoService.getAllProductsCombinedWithImages();
    } catch (error) {
      this.logger.error(`Error en getAllProductsCombinedWithImages: ${error.message}`);
      throw new InternalServerErrorException('Error al obtener productos combinados con imágenes');
    }
  }
}