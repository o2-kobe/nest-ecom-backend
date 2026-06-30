import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @IsInt()
  @Min(1)
  count!: number;

  @IsNumber()
  @Min(0)
  value!: number;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  expiresAt!: string;
}
