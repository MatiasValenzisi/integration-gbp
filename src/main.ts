import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
  app.use(bodyParser.urlencoded({limit: '50mb',extended: true}));
  app.use(bodyParser.json({limit: '50mb'}));
}

bootstrap();
