import { Injectable } from '@nestjs/common';

@Injectable()
export class CredentialService {
  readonly baseUrl: string;
  readonly userName: string;
  readonly password: string;
  readonly companyId: number;
  readonly webService: number;
  readonly storageGroup: string;

  constructor() {
    this.baseUrl = process.env.NUCLEO_BASE_URL || '';
    this.userName = process.env.NUCLEO_USERNAME || '';
    this.password = process.env.NUCLEO_PASSWORD || '';
    this.companyId = Number(process.env.NUCLEO_COMPANY) || 0;
    this.webService = Number(process.env.NUCLEO_WEB_SERVICE) || 0;
    this.storageGroup = process.env.NUCLEO_STORAGE_GROUP || '';
  }
}