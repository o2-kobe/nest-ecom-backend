import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';

@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN)
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  createCoupons(@Body() dto: CreateCouponDto) {
    return this.couponService.createManyCoupons(dto);
  }

  @Get()
  findAllCoupons() {
    return this.couponService.findAllCoupons();
  }

  @Get('/code/:code')
  findByCode(@Param('code') code: string) {
    return this.couponService.findByCode(code);
  }

  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.couponService.findById(id);
  }

  @Delete(':id')
  deleteCoupon(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.couponService.deleteCoupon(id);
  }
}
