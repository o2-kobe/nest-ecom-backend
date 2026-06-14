import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

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
}
