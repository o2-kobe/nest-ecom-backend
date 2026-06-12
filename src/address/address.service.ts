import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(dto: CreateAddressDto, user: User) {
    const address = this.addressRepository.create({ ...dto, user });

    return await this.addressRepository.save(address);
  }

  async findUserAddress(userId: string) {
    const address = await this.addressRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!address) throw new NotFoundException('Address does not exist');

    return address;
  }
}
