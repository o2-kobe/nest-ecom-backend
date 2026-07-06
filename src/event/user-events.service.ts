import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../user/entities/user.entity';
import type { UserRegisteredEvent } from './types/user-events.types';

@Injectable()
export class UserEventsService {
  constructor(private readonly eventEmmitter: EventEmitter2) {}

  emitUserRegistered(user: User): void {
    const userRegisteredEventData: UserRegisteredEvent = {
      user: {
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      },
    };

    this.eventEmmitter.emit('user.registered', userRegisteredEventData);
  }
}
