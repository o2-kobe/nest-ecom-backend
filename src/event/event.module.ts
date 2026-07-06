import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserEventsService } from './user-events.service';
import { UserRegisteredListener } from './listeners/user-register.listener';
import { QueueModule } from '../queue/queue.module';

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
  providers: [UserEventsService, UserRegisteredListener],
})
export class EventModule {}
