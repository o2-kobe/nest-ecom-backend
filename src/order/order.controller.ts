import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from '../auth/decorator/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(user.id, dto);
  }

  @Get()
  findUserOrders(@CurrentUser() user: User) {
    return this.orderService.findUserOrders(user.id);
  }

  @Get(':id')
  findOrder(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.orderService.findOrderById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/cancel')
  cancelOrder(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.orderService.cancelOrder(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto.status);
  }
}
