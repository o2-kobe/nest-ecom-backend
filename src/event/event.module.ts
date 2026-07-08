import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserEventsService } from './service/user-events.service';
import { UserRegisteredListener } from './listeners/user-register.listener';
import { QueueModule } from '../queue/queue.module';
import { OrderEventService } from './service/order-events.service';
import { OrderPlacedListener } from './listeners/order-placed.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true,
      wildcard: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    QueueModule,
  ],
  providers: [
    UserEventsService,
    UserRegisteredListener,
    OrderEventService,
    OrderPlacedListener,
  ],
  exports: [UserEventsService, OrderEventService],
})
export class EventModule {}
