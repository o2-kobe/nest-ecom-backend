import { SetMetadata } from '@nestjs/common';

export enum AuditActionType {
  PRICE_OVERRIDE = 'PRICE_OVERRIDE',
  MANUAL_REFUND = 'MANUAL_REFUND',
}

export const AUDIT_ACTION_KEY = 'audit_action';

export const AuditAction = (action: AuditActionType) =>
  SetMetadata(AUDIT_ACTION_KEY, action);
