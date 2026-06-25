import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cartItem.entity';
import { AddCartItemDto } from './dto/addCartItem.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productService: ProductsService,
  ) {}

  // TODO: USERcreation triggers cart creation
  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.findUserCart(userId);

    const product = await this.productService.findOne(dto.productId);

    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: product.id },
      },
    });

    if (existingItem) {
      existingItem.quantity += dto.quantity;

      return this.cartItemRepository.save(existingItem);
    }

    const item = this.cartItemRepository.create({
      cart,
      product,
      quantity: dto.quantity,
    });

    return this.cartItemRepository.save(item);
  }

  async findUserCart(userId: string) {
    const cart = await this.cartRepository.findOneBy({ user: { id: userId } });

    if (!cart) {
      const newCart = this.cartRepository.create({
        user: { id: userId },
      });

      return await this.cartRepository.save(newCart);
    }

    return cart;
  }
}

/**
getUserCart(userId)

addItem(userId, dto)

updateItemQuantity(userId, itemId, quantity)

removeItem(userId, itemId)

clearCart(userId)

calculateTotal(userId)
 */
