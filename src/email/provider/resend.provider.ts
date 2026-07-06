import { InternalServerErrorException, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export const RESEND_CLIENT = 'RESEND_CLIENT';

export const ResendProvider: Provider = {
  provide: RESEND_CLIENT,
  useFactory: (configService: ConfigService) => {
    const apiKey = configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Production Error: RESEND_API_KEY is missing from environment variables.',
      );
    }

    return new Resend(apiKey);
  },
  inject: [ConfigService],
};
