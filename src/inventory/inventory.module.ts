import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryProcessor } from './workers/inventory.processor';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory]),
    BullModule.registerQueue({
      name: 'inventory',
    }),
    OrderModule,
  ],
  providers: [InventoryService, InventoryProcessor],
  controllers: [InventoryController],
  exports: [InventoryService, BullModule],
})
export class InventoryModule {}
