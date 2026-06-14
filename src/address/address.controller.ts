import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateAddressDto,
    @CurrentUser() user: User,
  ): Promise<Address> {
    return this.addressService.create(dto, user.id);
  }

  @Get(':id')
  finOneById(@Param('id') id: string): Promise<Address> {
    return this.addressService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/user')
  findUserAddress(@CurrentUser() user: User): Promise<Address> {
    return this.addressService.findUserAddress(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: User,
  ) {
    return this.addressService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User): Promise<void> {
    return this.addressService.remove(id, user.id);
  }
}
