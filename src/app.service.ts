import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  // Say in the case we want to use the secret or configuration value here in this service then we need to inject first the config Service given to use by nestjs
  // constructor(private configService: ConfigService) {}
  // getHello(): string {
  //   // const appName = this.configService.get<string>('APP_NAME', 'defaultValue'); /////or we can use this rather
  //   const appName = this.configService.get<string>('appName');
  //   return `Hello World!. My App name is ${appName} `;
  // }
}
