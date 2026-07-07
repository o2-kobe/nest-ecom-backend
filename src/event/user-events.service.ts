import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { UserRegisteredEvent } from './types/user-events.types';

@Injectable()
export class UserEventsService {
  constructor(private readonly eventEmmitter: EventEmitter2) {}

  emitUserRegistered(user: {
    email: string;
    firstName: string;
    lastName: string;
  }): void {
    const userRegisteredEventData: UserRegisteredEvent = {
      user: {
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      },
    };

    this.eventEmmitter.emit('user.registered', userRegisteredEventData);
  }
}
