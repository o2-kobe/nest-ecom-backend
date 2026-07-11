import { IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';
import { AuditActionType } from '../../common/decorator/audit-action.decorator';

export class CreateAuditTrailDto {
  @IsUUID()
  userId!: string;

  @IsEnum(AuditActionType)
  action!: AuditActionType;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
