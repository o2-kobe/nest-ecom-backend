import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider!: AuthProvider;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true, select: false })
  refreshToken?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
