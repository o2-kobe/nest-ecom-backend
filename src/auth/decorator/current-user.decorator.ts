import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../user/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<Request>();

    return request.user as User;
  },
);
