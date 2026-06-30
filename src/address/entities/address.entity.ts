import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../order/entities/order.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.addresses)
  @JoinTable()
  user!: User;

  @Column()
  country!: string;

  @Column()
  city!: string;

  @Column()
  street!: string;

  @Column()
  postalCode!: string;

  @Column({ default: true })
  isDefault!: boolean;

  @OneToMany(() => Order, (order) => order.address)
  order!: Order;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
