import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('id')
  findById(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':addressId/default-addresss')
  setDefaultAddress(
    @Param('addressId') addressId: string,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.userService.setDefaultAddress(addressId, user.id);
  }
}
