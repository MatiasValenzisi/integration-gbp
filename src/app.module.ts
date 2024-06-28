import { Module } from '@nestjs/common';
import { NucleoModule } from './gbp/nucleo/nucleo.module';
import { LoggerConfigModule } from './logger.module';

@Module({
  imports: [
    LoggerConfigModule,
    NucleoModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}