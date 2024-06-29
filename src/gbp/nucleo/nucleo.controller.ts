import { Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { NucleoService } from './services/nucleo.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ImageResponseDto } from './dto/image-response.dto';

@Controller('nucleo')
export class NucleoController {
  
  constructor(private readonly nucleoService: NucleoService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(): Promise<LoginResponseDto> {
    try {
      const token: string = await this.nucleoService.authenticate();
      return { token };
    } catch (error) {
      throw new Error(`Error al obtener authenticate: ${error.message}`);
    }
  }

  @Get('brands')
  @HttpCode(HttpStatus.OK)
  async getAllBrands(): Promise<BrandResponseDto[]> {
    try {
      const brandResponseDtos: BrandResponseDto[] = await this.nucleoService.getAllBrands();
      return brandResponseDtos;
    } catch (error) {
      throw new Error(`Error al obtener getAllBrands: ${error.message}`);
    }
  }

  @Get('products/base')
  @HttpCode(HttpStatus.OK)
  async getAllProductsBase(): Promise<ProductResponseDto[]> {
    try {
      const productBaseResponseDtos: ProductResponseDto[] = await this.nucleoService.getAllProductsBase();
      const limitedProducts: ProductResponseDto[] = productBaseResponseDtos.slice(0, 100); // Mostrar los primeros 100 productos.
      return limitedProducts;
    } catch (error) {
      throw new Error(`Error al obtener getAllProductsBase: ${error.message}`);
    }
  }

  @Get('products/storage/group')
  @HttpCode(HttpStatus.OK)
  async getAllProductsStorageGroup(): Promise<ProductResponseDto[]> {
    try {
      const productStorageGroupResponseDtos: ProductResponseDto[] = await this.nucleoService.getAllProductsStorageGroup();
      const limitedProducts: ProductResponseDto[] = productStorageGroupResponseDtos.slice(0, 100); // Mostrar los primeros 100 productos.
      return limitedProducts;
    } catch (error) {
      throw new Error(`Error al obtener getAllProductsStorageGroup: ${error.message}`);
    }
  }

  @Get('products/combined')
  @HttpCode(HttpStatus.OK)
  async getAllProductsCombined(): Promise<ProductResponseDto[]> {
    try {
      const productCombinedResponseDtos: ProductResponseDto[] = await this.nucleoService.getAllProductsCombined();
      const limitedProducts: ProductResponseDto[] = productCombinedResponseDtos.slice(0, 100); // Mostrar los primeros 100 productos.
      return limitedProducts;
    } catch (error) {
      throw new Error(`Error al obtener getAllProductsCombined: ${error.message}`);
    }
  }

  @Get('product/images/load/:id')
  @HttpCode(HttpStatus.OK)
  async loadImagesById(@Param('id') id: number): Promise<ImageResponseDto[]> {
    try {
      const imageResponseDtos: ImageResponseDto[] = await this.nucleoService.loadImagesById(id);
      return imageResponseDtos;
    } catch (error) {
      throw new Error(`Error al obtener getImageById: ${error.message}`);
    }
  }

  @Get('products/combined/withimages')
  @HttpCode(HttpStatus.OK)
  async getAllProductsCombinedWithImages(): Promise<ProductResponseDto[]> {
    try {
      const productCombinedWithImagesResponseDtos: ProductResponseDto[] = await this.nucleoService.getAllProductsCombinedWithImages();
      const limitedProducts: ProductResponseDto[] = productCombinedWithImagesResponseDtos.slice(0, 1000); // Mostrar los primeros 1000 productos.
      return limitedProducts;
    } catch (error) {
      throw new Error(`Error al obtener getAllProductsCombinedWithImages: ${error.message}`);
    }
  }
}