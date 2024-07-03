import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {  
  
  dotenv.config();  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);  
  
  app.useStaticAssets(join(__dirname, '..', 'public'));  

  // Configuración global de pipes.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve todo lo que no esta incluido en los DTOs
      forbidNonWhitelisted: true, // Retorna bad request si hay propiedades en el objeto no requerido.
    })
  )

  await app.listen(process.env.PORT || 3000);
}

bootstrap();