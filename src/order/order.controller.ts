import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from '../auth/decorator/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AuditAction,
  AuditActionType,
} from '../common/decorator/audit-action.decorator';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';

@UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseInterceptors(AuditInterceptor)
  @AuditAction(AuditActionType.CANCEL_ORDER)
  @Patch(':id/cancel')
  cancelOrder(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.orderService.cancelOrder(id);
  }

  @Roles(UserRole.ADMIN)
  @UseInterceptors(AuditInterceptor)
  @AuditAction(AuditActionType.UPDATE_ORDER_STATUS)
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto.status);
  }
}
