import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { type OrderPlacedEvent } from '../types/order-events.type';

@Injectable()
export class OrderPlacedListener {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('inventory') private readonly inventoryQueue: Queue,
  ) {}

  @OnEvent('order.placed')
  async handleOrderPlacedEvent(event: OrderPlacedEvent) {
    await Promise.all([
      this.emailQueue.add('order-confirmation-email', {
        orderId: event.id,
      }),

      this.inventoryQueue.add('deduct-stock', {
        orderId: event.id,
      }),
    ]);
  }
}
