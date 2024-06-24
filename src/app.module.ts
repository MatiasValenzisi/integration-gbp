import { Module } from '@nestjs/common';
import { NucleoModule } from './gbp/nucleo/nucleo.module';

@Module({
  imports: [NucleoModule],
  controllers: [],
  providers: [],
  exports: [],
})

export class AppModule {}
