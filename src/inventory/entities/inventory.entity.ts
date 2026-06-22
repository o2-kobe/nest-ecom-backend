import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Product, (product) => product.inventory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product!: Product;

  @Column({ default: 0 })
  quantity!: number;

  @Column({ default: 0 })
  reservedQuantity!: number;

  @Column({ default: 1 })
  lowStockThreshold!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
