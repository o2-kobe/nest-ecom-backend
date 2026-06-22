import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async create(productId: string, dto: CreateInventoryDto): Promise<Inventory> {
    const inventory = this.inventoryRepository.create({
      product: { id: productId },
      ...dto,
    });

    return await this.inventoryRepository.save(inventory);
  }

  async findByProduct(productId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        id: productId,
      },
      relations: { product: true },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return inventory;
  }

  async updateStock(productId: string, quantity: number): Promise<Inventory> {
    const inventory = await this.findByProduct(productId);

    if (quantity < 0) {
      throw new BadRequestException('Stock quantity must be greater than 0');
    }

    inventory.quantity = quantity;

    return await this.inventoryRepository.save(inventory);
  }

  async reserveStock(productId: string, quantity: number) {
    const inventory = await this.findByProduct(productId);

    const availableQuantity = inventory.quantity - inventory.reservedQuantity;

    if (availableQuantity < quantity) {
      throw new BadRequestException(
        `Only ${availableQuantity} items available.`,
      );
    }

    inventory.reservedQuantity += quantity;

    await this.inventoryRepository.save(inventory);

    return inventory;
  }

  async releaseReservedStock(productId: string, quantity: number) {
    const inventory = await this.findByProduct(productId);

    if (inventory.reservedQuantity < quantity) {
      throw new BadRequestException('Cannot release more than reserved stock.');
    }

    inventory.reservedQuantity -= quantity;

    await this.inventoryRepository.save(inventory);

    return inventory;
  }

  async updateInventory(productId: string, dto: UpdateInventoryDto) {
    const inventory = await this.findByProduct(productId);

    const { quantity, lowStockThreshold } = dto;

    if (quantity) {
      inventory.quantity = quantity;
    }

    if (lowStockThreshold) {
      inventory.lowStockThreshold = lowStockThreshold;
    }

    return await this.inventoryRepository.save(inventory);
  }

  async getLowStockProducts() {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.lowStockThreshold IS NOT NULL')
      .andWhere('inventory.quantity <= inventory.lowStockThreshold')
      .getMany();
  }
}

// Can explore a cron job that emits events when inventory is lowstock
