import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { AddCartItemDto } from './dto/addCartItem.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  addCartItem(@CurrentUser() user: User, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Get()
  findUserCart(@CurrentUser() user: User) {
    return this.cartService.findUserCart(user.id);
  }

  @Post('remove/:id')
  removeCartItem(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.cartService.removeItem(user.id, id);
  }

  @Post('clear')
  clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user.id);
  }
}
