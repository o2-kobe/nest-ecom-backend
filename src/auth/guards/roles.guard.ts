import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from '../../user/entities/user.entity';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (!user) throw new ForbiddenException('Unauthenticated');

    const hasRequiredRoles = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRoles)
      throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
