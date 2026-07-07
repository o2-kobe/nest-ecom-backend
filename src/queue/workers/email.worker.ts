import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { EmailService } from '../../email/email.service';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

interface EmailJobData {
  to: string;
  fullName: string;
}

@Processor('email', { concurrency: 2 })
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<EmailJobData>) {
    const { to, fullName } = job.data;

    switch (job.name) {
      case 'welcome-email':
        return this.emailService.sendWelcomeEmail(to, fullName);
      default:
        throw new Error(`No handler found for ${job.name}`);
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} [${job.name}] is now ACTIVE`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} [${job.name}] has COMPLETED successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} FAILED on attempt ${job.attemptsMade}. Error: ${error.message}`,
    );
  }
}
