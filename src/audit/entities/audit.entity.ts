import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AuditActionType } from '../../common/decorator/audit-action.decorator';

@Entity('audit_trails')
export class AuditTrail {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'enum', enum: AuditActionType })
  action!: AuditActionType;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, unknown>;

  @CreateDateColumn()
  timestamp!: Date;
}
