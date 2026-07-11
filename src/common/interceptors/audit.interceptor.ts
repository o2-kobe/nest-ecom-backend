import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { User } from '../../user/entities/user.entity';
import { Reflector } from '@nestjs/core';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  AUDIT_ACTION_KEY,
  AuditActionType,
} from '../decorator/audit-action.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @InjectQueue('audit') private readonly auditQueue: Queue,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const auditMethod = this.reflector.get<AuditActionType>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    if (!auditMethod) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request?.user as User;
    const body = request.body as Record<string, unknown>;

    return next.handle().pipe(
      tap(() => {
        void this.auditQueue.add(auditMethod, {
          userId: user.id,
          action: auditMethod,
          payload: body,
        });
      }),
    );
  }
}
