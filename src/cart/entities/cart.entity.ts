import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CartItem } from './cartItem.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn()
  user!: User;

  @OneToMany(() => CartItem, (item) => item.cart)
  items!: CartItem[];
}
