import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { OrderItem } from './entities/orderItem.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Coupon, DiscountType } from '../coupon/entities/coupon.entity';
import { CartItem } from '../cart/entities/cartItem.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { customAlphabet } from 'nanoid';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    // Start the database transaction
    return await this.dataSource
      .transaction(async (transactionalEntityManager) => {
        // Generate unique code
        const generateOrderCode = customAlphabet(
          '23456789ABCDEFGHJKLMNPQRSTUVWXYZ',
          8,
        );
        const code = `ORD-${generateOrderCode()}`;

        // Fetch the user's active cart items
        const cartItems = await transactionalEntityManager.find(CartItem, {
          where: { cart: { user: { id: userId } } },
          relations: ['product'],
        });

        if (!cartItems || cartItems.length === 0) {
          throw new BadRequestException('Your shopping cart is empty');
        }

        let rawTotal = 0;
        const orderItems: OrderItem[] = [];

        // Loop through items to lock inventory, validate stock, and calculate prices
        for (const cartItem of cartItems) {
          // Pessimistic lock on the inventory row to prevent race conditions
          const inventory = await transactionalEntityManager.findOne(
            Inventory,
            {
              where: { product: { id: cartItem.product.id } },
              lock: { mode: 'pessimistic_write' },
            },
          );

          if (!inventory) {
            throw new BadRequestException(
              `Inventory record not found for product: ${cartItem.product.name}`,
            );
          }

          // Double-check validation: absolute truth stock verification
          const availableStock =
            inventory.quantity - inventory.reservedQuantity;
          if (cartItem.quantity > availableStock) {
            throw new BadRequestException(
              `Not enough stock available for ${cartItem.product.name}`,
            );
          }

          // Mutate data: increment the reserved quantity
          inventory.reservedQuantity += cartItem.quantity;
          await transactionalEntityManager.save(Inventory, inventory);

          // Calculate subtotal for the individual order item
          const itemSubtotal = cartItem.product.price * cartItem.quantity;
          rawTotal += itemSubtotal;

          // Prepare the OrderItem instance
          const orderItem = new OrderItem();
          orderItem.product = cartItem.product;
          orderItem.quantity = cartItem.quantity;
          orderItem.price = cartItem.product.price;
          orderItem.subtotal = itemSubtotal;

          orderItems.push(orderItem);
        }

        // Handle Coupon application if a code is provided
        let finalTotal = rawTotal;
        let appliedCoupon: Coupon | null = null;

        if (dto.couponCode) {
          appliedCoupon = await transactionalEntityManager.findOne(Coupon, {
            where: { code: dto.couponCode, isActive: true },
          });

          if (!appliedCoupon) {
            throw new BadRequestException('Invalid or expired coupon code');
          }

          // Apply percentage or flat discounts safely
          if (appliedCoupon.discountType === DiscountType.PERCENTAGE) {
            finalTotal = ((100 - Number(appliedCoupon.value)) / 100) * rawTotal;
          } else if (appliedCoupon.discountType === DiscountType.FIXED_AMOUNT) {
            finalTotal = rawTotal - Number(appliedCoupon.value);
          }

          // Guard against negative order totals using Math.max
          finalTotal = Math.max(0, finalTotal);
        }

        // Create and save the parent Order entity first
        const order = new Order();
        order.user.id = userId;
        order.orderCode = code;
        order.totalAmount = finalTotal;
        order.coupon = appliedCoupon;
        order.status = OrderStatus.PENDING;

        const savedOrder = await transactionalEntityManager.save(Order, order);

        // Link the parent order ID to the order items and save them
        for (const item of orderItems) {
          item.order = savedOrder;
        }
        await transactionalEntityManager.save(OrderItem, orderItems);

        // Clean up: Delete the user's cart items
        const userCart = cartItems[0].cart;
        await transactionalEntityManager.delete(CartItem, {
          cart: { id: userCart.id },
        });

        // Return the fully constructed and saved order object
        return savedOrder;
      })
      .catch((error) => {
        // Rollback happens automatically if any error is thrown inside the transaction block
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException(
          'Checkout failed due to a server error',
        );
      });
  }

  async findUserOrders(userId: string) {
    return await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: { items: true },
    });
  }

  async findOrderById(id: string) {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order does not exist');
    }

    return order;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return await this.dataSource
      .transaction(async (transactionalEntityManager) => {
        // Fetch the order along with its items and product relations
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
          relations: ['items', 'items.product'],
        });

        if (!order) {
          throw new BadRequestException(`Order with ID ${orderId} not found`);
        }

        // Status Validation Check
        const allowedStatuses = ['PENDING', 'PROCESSING', 'PAID'];
        if (!allowedStatuses.includes(order.status)) {
          throw new BadRequestException(
            `Order cannot be cancelled because its current status is ${order.status}`,
          );
        }

        // Loop through items to release the reserved inventory
        for (const item of order.items) {
          // Pessimistic lock on the inventory row to prevent concurrent updates
          const inventory = await transactionalEntityManager.findOne(
            Inventory,
            {
              where: { product: { id: item.product.id } },
              lock: { mode: 'pessimistic_write' },
            },
          );

          if (inventory) {
            // Remove the ordered quantity from the reserved hold
            inventory.reservedQuantity -= item.quantity;

            // Safety guard: ensure reserved quantity never drops below zero
            inventory.reservedQuantity = Math.max(
              0,
              inventory.reservedQuantity,
            );

            await transactionalEntityManager.save(Inventory, inventory);
          }
        }

        // Update the order status and record who cancelled it
        order.status = OrderStatus.CANCELLED;

        // Save and return the finalized order
        return await transactionalEntityManager.save(Order, order);
      })
      .catch((error) => {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException('Order cancellation failed');
      });
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<Order> {
    return await this.dataSource
      .transaction(async (transactionalEntityManager) => {
        // Fetch the order along with its items
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
          relations: ['orderItems', 'orderItems.product'],
        });

        if (!order) {
          throw new BadRequestException(`Order with ID ${orderId} not found`);
        }

        // Prevent updating an already finalized order
        if (
          order.status === OrderStatus.CANCELLED ||
          order.status === OrderStatus.DELIVERED
        ) {
          throw new BadRequestException(
            `Cannot change status of an order that is already ${order.status}`,
          );
        }

        // If transitioning to SHIPPED, deduct physical inventory numbers
        if (
          newStatus === OrderStatus.SHIPPED &&
          order.status !== OrderStatus.SHIPPED
        ) {
          for (const item of order.items) {
            // Pessimistic lock on the inventory row
            const inventory = await transactionalEntityManager.findOne(
              Inventory,
              {
                where: { product: { id: item.product.id } },
                lock: { mode: 'pessimistic_write' },
              },
            );

            if (inventory) {
              // Reduce physical stock since the item left the warehouse
              inventory.quantity -= item.quantity;

              // Clear the reserved hold we put on it during checkout
              inventory.reservedQuantity -= item.quantity;

              // Safety guards to ensure values never drop below zero
              inventory.quantity = Math.max(0, inventory.quantity);
              inventory.reservedQuantity = Math.max(
                0,
                inventory.reservedQuantity,
              );

              await transactionalEntityManager.save(Inventory, inventory);
            }
          }
        }

        // Update order status and track the admin who did it
        order.status = newStatus;

        // Save and return the updated order
        return await transactionalEntityManager.save(Order, order);
      })
      .catch((error) => {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException('Failed to update order status');
      });
  }
}
