import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
@Index(['order', 'product'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column()
  orderId!: string;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    eager: true, //  auto-load product details
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column()
  productId!: string;

  @Column({
    type: 'int',
  })
  quantity!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subtotal!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
