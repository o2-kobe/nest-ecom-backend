import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    return (await super.canActivate(context)) as boolean;
  }
}
