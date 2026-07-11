import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { EmailService } from '../email.service';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OrderService } from '../../order/order.service';

interface EmailJobData {
  to: string;
  fullName?: string;
  orderId?: string;
}

@Processor('email', { concurrency: 2 })
export class EmailProcessor extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly orderService: OrderService,
  ) {
    super();
  }

  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<EmailJobData>) {
    const { to, fullName, orderId } = job.data;

    switch (job.name) {
      case 'welcome-email':
        return this.emailService.sendWelcomeEmail(to, fullName!);

      case 'order-confirmation-email': {
        const order = await this.orderService.findOrderById(orderId!);
        return this.emailService.sendOrderConfirmationEmail(order);
      }

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job: ${job.name} [${job.name}] is now ACTIVE`);
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
