import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('lowStockProducts')
  findLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get(':productId')
  findByProduct(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
  ) {
    return this.inventoryService.findByProduct(productId);
  }

  @Patch(':productId')
  updateInventory(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateInventory(productId, dto);
  }
}
