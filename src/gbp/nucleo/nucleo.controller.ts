import { Controller, Get, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { NucleoService } from './services/nucleo.service';

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
      const brands = await this.nucleoService.getAllBrands();
      return res.status(200).json(brands);
    } catch (error) {
      res.status(500).json({ msg: `getAllBrands | Error al obtener las marcas | ${error}` });
    }
  }

  @Get('products')
  async getAllProductsWithStock(@Res() res: Response) {
    try {      
      const products = await this.nucleoService.getAllProductsWithStock();
      //return res.status(200).json(products);
      
      console.log(products)
      const limitedProducts = products.slice(0, 500); // Demostración de los primeros 500 productos. // Temporal.
      return res.status(200).json(limitedProducts); // Temporal.

    } catch (error) {
      res.status(500).json({ msg: `getAllProductsWithStock - controller | Error al obtener los productos | ${error.message}` });
    }
  }

  @Get('products/paginated/:pageNumber')
  async getAllProductsWithStockPaginated(@Res() res: Response, @Param('pageNumber', ParseIntPipe ) pageNumber: number) {
    try {      
      const productsPaginated = await this.nucleoService.getAllProductsWithStockPaginated(pageNumber);
      return res.status(200).json('productsPaginated');
    } catch (error) {
      res.status(500).json({ msg: `getAllProductsWithStockPaginated - controller | Error al obtener los productos | ${error.message}` });
    }
  }

}