import { Controller, Get, Param, ParseIntPipe, Post, Query, Res } from '@nestjs/common';
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
  async getAllProducts(@Res() res: Response) {
    try {      
      const products = await this.nucleoService.getAllProducts();
      return res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ msg: `getAllProducts - controller | Error al obtener los productos | ${error.message}` });
    }
  }

  @Get('products/paginated/:pagination')
  async getAllProductsPaginated(@Res() res: Response, @Param('pagination', ParseIntPipe ) pagination: number) {
    try {      
      const productsPaginated = await this.nucleoService.getAllProductsPaginated(pagination);
      return res.status(200).json('productsPaginated');
    } catch (error) {
      res.status(500).json({ msg: `getAllProducts - controller | Error al obtener los productos | ${error.message}` });
    }
  }

}