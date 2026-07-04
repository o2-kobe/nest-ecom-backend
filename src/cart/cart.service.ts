import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cartItem.entity';
import { AddCartItemDto } from './dto/addCartItem.dto';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productService: ProductsService,
    private readonly inventoryService: InventoryService,
  ) {}

  async addItem(userId: string, dto: AddCartItemDto) {
    const [cart, product, productInventory] = await Promise.all([
      this.findUserCart(userId),
      this.productService.findOne(dto.productId),
      this.inventoryService.findByProduct(dto.productId),
    ]);

    const existingItem = await this.findCartItem(cart.id, product.id);

    const availableStock =
      productInventory.quantity - productInventory.reservedQuantity;
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequestedQuantity = currentQuantity + dto.quantity;

    if (totalRequestedQuantity > availableStock) {
      throw new BadRequestException('Not enough stock available');
    }

    if (existingItem) {
      existingItem.quantity = totalRequestedQuantity;
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

  async createUserCart(userId: string) {
    return await this.cartRepository.save(
      this.cartRepository.create({ user: { id: userId } }),
    );
  }

  async removeItem(userId: string, itemId: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { user: { id: userId } } },
      relations: ['cart'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!cart) {
      throw new NotFoundException('User cart not found');
    }

    cart.items = [];
    return await this.cartRepository.save(cart);
  }

  private async findCartItem(cartId: string, productId: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cartId },
        product: { id: productId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('CartItem not found');
    }

    return cartItem;
  }
}
