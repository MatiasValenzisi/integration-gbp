import { Module } from '@nestjs/common';
import { NucleoController } from './nucleo.controller';
import { NucleoService } from './services/nucleo.service';
import { AxiosService } from './services/axios.service';
import { Xml2jsService } from './services/xml2js.service';
import { CredentialService } from './services/credential.service';

@Module({
  imports: [],
  controllers: [NucleoController],
  providers: [NucleoService, CredentialService, AxiosService, Xml2jsService],
  exports: [],
})

export class NucleoModule {}
