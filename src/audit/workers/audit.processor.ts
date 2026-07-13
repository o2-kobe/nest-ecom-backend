import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuditService } from '../audit.service';
import { AuditActionType } from '../../common/decorator/audit-action.decorator';
import { Logger } from '@nestjs/common';

interface AuditJobType {
  userId: string;
  action: AuditActionType;
  payload: Record<string, unknown>;
}

@Processor('audit')
export class AuditProcessor extends WorkerHost {
  constructor(private readonly auditService: AuditService) {
    super();
  }

  private readonly logger = new Logger(AuditProcessor.name);

  async process(job: Job<AuditJobType>) {
    return await this.auditService.create(job.data);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job: ${job.name} is now ACTIVE`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} [${job.name}] has COMPLETED successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.name} FAILED on attempt ${job.attemptsMade}. Error: ${error.message}`,
    );
  }
}
