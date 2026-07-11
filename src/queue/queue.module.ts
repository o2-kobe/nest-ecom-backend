import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from '../email/email.module';
import { OrderModule } from '../order/order.module';
import { EmailProcessor } from './workers/email.processor';
import { InventoryProcessor } from './workers/inventory.processor';
import { InventoryModule } from '../inventory/inventory.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: { host: 'localhost', port: 6379 },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 1000,
        removeOnFail: 3000,
        backoff: 2000,
      },
    }),

    BullModule.registerQueue(
      { name: 'email' },
      { name: 'inventory' },
      { name: 'audit' },
    ),

    EmailModule,

    OrderModule,

    InventoryModule,

    AuditModule,
  ],
  providers: [EmailProcessor, InventoryProcessor],
  exports: [BullModule],
})
export class QueueModule {}
