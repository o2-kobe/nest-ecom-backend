import {
  Column,
  Entity,
  JoinTable,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.address)
  @JoinTable()
  user?: User;

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
