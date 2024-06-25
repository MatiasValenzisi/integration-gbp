import { Controller, Get, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { NucleoService } from './services/nucleo.service';
import { ProductItem } from './interfaces/product-Item.interface';
import { ProductStorageGroupItem } from './interfaces/product-storage-group-Item.interface';
import { BrandItem } from './interfaces/brand-Item.interface';

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
      console.log('Cantidad de productos: ' + products.length);
      const limitedProducts = products.slice(0, 500); // Mostrar los primeros 500 productos.
      return res.status(200).json(limitedProducts);

    } catch (error) {
      res.status(500).json({ msg: `getAllProducts - controller | Error al obtener los productos | ${error.message}` });
    }
  }

  @Get('products/storage/group')
  async getAllProductsStorageGroup(@Res() res: Response) {
    try {      
      const products: ProductStorageGroupItem[] = await this.nucleoService.getAllProductsStorageGroup(); 
      console.log('Cantidad de productos: ' + products.length);
      const limitedProducts = products.slice(0, 500); // Mostrar los primeros 500 productos.
      return res.status(200).json(limitedProducts);

    } catch (error) {
      res.status(500).json({ msg: `getAllProductsStorageGroup - controller | Error al obtener los productos | ${error.message}` });
    }
  }
}