import { Injectable } from '@nestjs/common';

@Injectable()
export class CredentialService {
  readonly baseUrl: string = process.env.NUCLEO_BASE_URL || '';
  readonly userName: string = process.env.NUCLEO_USERNAME || '';
  readonly password: string = process.env.NUCLEO_PASSWORD || '';
  readonly companyId: number = Number(process.env.NUCLEO_COMPANY) || 0;
  readonly webService: number = Number(process.env.NUCLEO_WEB_SERVICE) || 0;
  readonly authenticatedToken: string = process.env.NUCLEO_AUTHENTICATED_TOKEN || '';
  readonly storageGroup: string = process.env.NUCLEO_STORAGE_GROUP || '';
}