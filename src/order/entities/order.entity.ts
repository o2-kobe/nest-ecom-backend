import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Address } from '../../address/entities/address.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { OrderItem } from './orderItem.entity';

export enum OrderStatus {
  PENDING = 'pending', // Order created, awaiting payment
  PAYMENT_FAILED = 'payment_failed',
  PAID = 'paid', // Payment successful
  PROCESSING = 'processing', // Merchant preparing the order
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.orders)
  user!: User;

  @ManyToOne(() => Address)
  address!: Address;

  @OneToOne(() => Coupon, { nullable: true })
  @JoinColumn()
  coupon!: Coupon | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalAmount!: number;
}
