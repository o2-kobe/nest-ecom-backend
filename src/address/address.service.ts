import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(dto: CreateAddressDto, userId: string): Promise<Address> {
    const address = this.addressRepository.create({
      ...dto,
      user: { id: userId },
    });

    return await this.addressRepository.save(address);
  }

  async findUserAddress(userId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!address) throw new NotFoundException('Address does not exist');

    return address;
  }

  async findById(id: string): Promise<Address> {
    const address = await this.addressRepository.findOneBy({ id });

    if (!address) throw new NotFoundException('Address does not exist');

    return address;
  }

  async update(
    addressId: string,
    dto: UpdateAddressDto,
    userId: string,
  ): Promise<Address> {
    const updateResult = await this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set(dto)
      .where('id = :addressId AND userId = :userId', { addressId, userId }) // user ownership check
      .returning('*') // Tells Postgres to send back the updated row immediately
      .execute();

    if (updateResult.affected === 0) {
      throw new ForbiddenException(
        'Address not found or you do not have permission',
      );
    }

    const rawResults = updateResult.raw as Address[];

    return rawResults[0];
  }

  async remove(addressId: string, userId: string): Promise<void> {
    const address = await this.findById(addressId);

    if (address.user?.id !== userId) {
      throw new ForbiddenException('You can only update your address');
    }

    await this.addressRepository.remove(address);
  }
}
