import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from '../../address/entities/address.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Order } from '../../order/entities/order.entity';
import { Review } from '../../review/entities/review.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  avatar!: string | null;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true, select: false })
  password!: string | null;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider!: AuthProvider;

  @Column({ nullable: true, select: false })
  googleId!: string | null;

  @Column({ nullable: true, select: false })
  refreshToken!: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @OneToMany(() => Address, (address) => address.user)
  addresses!: Address[];

  @OneToOne(() => Address, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  defaultAddress!: Address | null;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart!: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
