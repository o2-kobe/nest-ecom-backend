import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    length: 100,
  })
  name!: string;

  @Column({ unique: true, length: 120 })
  slug!: string;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
