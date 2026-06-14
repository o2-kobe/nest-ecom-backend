import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { AuthProvider, User, UserRole } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { AddressService } from '../address/address.service';

type PostgresError = QueryFailedError & { code?: string };

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly addressService: AddressService,
  ) {}

  async createUser(dto: CreateUserDto, role: UserRole): Promise<User> {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.findByEmail(email);
    if (!existingUser) {
      throw new ConflictException('Email already in use');
    }

    const { firstName, lastName, password } = dto;

    const newUser = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: await bcrypt.hash(password!, 10),
      role,
      provider: AuthProvider.LOCAL,
    });

    let savedUser: User;

    try {
      savedUser = await this.userRepository.save(newUser);
    } catch (error: unknown) {
      const err = error as PostgresError;

      if (err instanceof QueryFailedError && err.code === '23505') {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, refreshToken: __, ...safeUser } = savedUser;

    return safeUser;
  }

  async findOrCreateOAuthUser(dto: CreateUserDto): Promise<User> {
    const { email, firstName, lastName, googleId } = dto;

    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      return existingUser;
    }

    const newUser = this.userRepository.create({
      email,
      firstName,
      lastName,
      googleId,
      provider: AuthProvider.GOOGLE,
      role: UserRole.USER,
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      const dbError = error as { code?: string; message?: string };

      if (dbError.code === '23505' || dbError.message?.includes('unique')) {
        const concurrentUser = await this.findByEmail(email);
        if (concurrentUser) return concurrentUser;
      }

      throw new InternalServerErrorException(
        'An error occurred during account provisioning.',
      );
    }
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string | null) {
    if (hashedRefreshToken)
      await this.userRepository.update(userId, {
        refreshToken: hashedRefreshToken,
      });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User does not exist');

    return user;
  }

  async findLocalUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email, provider: AuthProvider.LOCAL },
      select: ['id', 'email', 'password', 'role', 'refreshToken'],
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.findById(userId);

    await this.userRepository.remove(user);
  }

  // Set Default Address
  async setDefaultAddress(userId: string, addressId: string): Promise<User> {
    const address = await this.addressService.findById(addressId);

    if (address.user.id !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    await this.userRepository.update(userId, {
      defaultAddress: { id: addressId },
    });

    return this.findById(userId);
  }
}
