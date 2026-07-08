import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../../order/entities/order.entity';
import { Injectable } from '@nestjs/common';
import { OrderPlacedEvent } from '../types/order-events.type';

@Injectable()
export class OrderEventService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitOrderPlacedEvent(order: Order) {
    const orderPlacedEventData: OrderPlacedEvent = {
      id: order.id,
    };

    this.eventEmitter.emit('order.placed', orderPlacedEventData);
  }
}
