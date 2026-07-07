import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import type { UserRegisteredEvent } from '../types/user-events.types';

@Injectable()
export class UserRegisteredListener {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  @OnEvent('user.registered')
  async handleUserRegisteredEvent(event: UserRegisteredEvent): Promise<void> {
    const {
      user: { email, fullName },
    } = event;

    await this.emailQueue.add(
      'welcome-email',
      {
        to: email,
        fullName,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }
}
