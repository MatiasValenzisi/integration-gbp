import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { NucleoService } from './services/nucleo.service';
import { ProductItem } from './interfaces/product-Item.interface';
import { ProductStorageGroupItem } from './interfaces/product-storage-group-item.interface';
import { BrandItem } from './interfaces/brand-item.interface';

@Controller('nucleo')
export class NucleoController {
  
  constructor(private readonly nucleoService: NucleoService) {}

  @Post('login')
  async postLogin(@Res() res: Response) {
    try {
      const authenticateUserResult: string = await this.nucleoService.authenticate();
      return res.status(200).json({ authenticateUserResult });
    } catch (error) {
      res.status(500).json({ msg: `postLogin | Error en la solicitud de autenticación | ${error}` });
    }
  }

  @Get('brands')
  async getAllBrands(@Res() res: Response) {
    try {      
      const brands: BrandItem[] = await this.nucleoService.getAllBrands();
      return res.status(200).json(brands);
    } catch (error) {
      res.status(500).json({ msg: `getAllBrands | Error al obtener las marcas | ${error}` });
    }
  }

  @Get('products')
  async getAllProducts(@Res() res: Response) {
    try {      
      const products: ProductItem[] = await this.nucleoService.getAllProducts(); 
      console.log('Cantidad de productos totales: ' + products.length);
      const limitedProducts = products.slice(0, 10); // Mostrar los primeros 10 productos.
      return res.status(200).json(limitedProducts);

    } catch (error) {
      res.status(500).json({ msg: `getAllProducts - controller | Error al obtener los productos | ${error.message}` });
    }
  }

  @Get('products/storage/group')
  async getAllProductsStorageGroup(@Res() res: Response) {
    try {      
      const products: ProductStorageGroupItem[] = await this.nucleoService.getAllProductsStorageGroup(); 
      console.log('Cantidad de productos de un grupo: ' + products.length);
      const limitedProducts = products.slice(0, 10); // Mostrar los primeros 10 productos.
      return res.status(200).json(limitedProducts);

    } catch (error) {
      res.status(500).json({ msg: `getAllProductsStorageGroup - controller | Error al obtener los productos de un grupo | ${error.message}` });
    }
  }

  @Get('products/updated/instock')
  async getUpdatedProductsInStock(@Res() res: Response) {
    try {      
      const products = await this.nucleoService.getUpdatedProductsInStock(); 
      console.log('Cantidad de productos actualizados en stock: ' + products.length);
      const limitedProducts = products.slice(0, 10); // Mostrar los primeros 10 productos.
      return res.status(200).json(limitedProducts);

    } catch (error) {
      res.status(500).json({ msg: `getUpdatedProductsInStock - controller | Error al obtener los productos en stock | ${error.message}` });
    }
  }
  
  @Get('products/withimages')
  async getProductsWithImages(@Res() res: Response) {
    try {      
      const products: any[] = await this.nucleoService.getProductsWithImages();
      console.log('Cantidad de productos con imagenes: ' + products.length);
      const limitedProducts = products.slice(0, 10); // Mostrar los primeros 10 productos.
      return res.status(200).json(limitedProducts);

    } catch (error) {
      res.status(500).json({ msg: `getProductsWithImages - controller | Error al obtener los productos en stock con imagenes | ${error.message}` });
    }
  }
}