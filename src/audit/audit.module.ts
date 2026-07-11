import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditTrail } from './entities/audit.entity';
import { AuditProcessor } from './workers/audit.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditTrail]),
    BullModule.registerQueue({
      name: 'audit',
    }),
  ],
  providers: [AuditService, AuditProcessor],
  controllers: [AuditController],
  exports: [AuditService, BullModule],
})
export class AuditModule {}
