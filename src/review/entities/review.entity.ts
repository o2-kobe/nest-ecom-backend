import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
@Check(`"rating" >= 1.0 AND "rating" <= 5.0`)
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'decimal',
    precision: 2,
    scale: 1,
  })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  product!: Product;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
