import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { ResendProvider } from './provider/resend.provider';
import { EmailProcessor } from './workers/email.processor';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
    OrderModule,
  ],
  providers: [EmailService, ResendProvider, EmailProcessor],
  exports: [EmailService, BullModule],
})
export class EmailModule {}
