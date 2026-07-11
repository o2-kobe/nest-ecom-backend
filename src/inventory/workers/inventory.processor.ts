import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrderService } from '../../order/order.service';
import { InventoryService } from '../inventory.service';
import { Logger } from '@nestjs/common';

interface InventoryJobData {
  orderId: string;
}

@Processor('inventory', { concurrency: 2 })
export class InventoryProcessor extends WorkerHost {
  constructor(
    private readonly orderService: OrderService,
    private readonly inventoryService: InventoryService,
  ) {
    super();
  }

  private readonly logger = new Logger(InventoryProcessor.name);

  async process(job: Job<InventoryJobData>) {
    switch (job.name) {
      case 'deduct-stock': {
        const { orderId } = job.data;

        const order = await this.orderService.findOrderById(orderId);

        return this.inventoryService.deductStock(order.items);
      }

      default:
        throw new Error(`Unknown job: ${job.name}`);
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
