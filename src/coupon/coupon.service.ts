import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async createManyCoupons(dto: CreateCouponDto): Promise<Coupon[]> {
    const coupons: Coupon[] = [];

    for (let i = 0; i < dto.count; i++) {
      const code = await this.generateUniqueCode();

      const coupon = this.couponRepository.create({
        code,
        isActive: true,
        value: String(dto.value),
        startsAt: dto.startsAt,
        expiresAt: dto.expiresAt,
        description: dto.description,
        discountType: dto.discountType,
      });

      coupons.push(coupon);
    }

    return this.couponRepository.save(coupons);
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOneBy({ id });

    if (!coupon) {
      throw new NotFoundException('Coupon does not exist');
    }

    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOneBy({ code });

    if (!coupon) {
      throw new NotFoundException('Coupon does not exist');
    }

    return coupon;
  }

  async findAllCoupons(): Promise<Coupon[]> {
    return await this.couponRepository.find({});
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupon = await this.findById(id);

    await this.couponRepository.softRemove(coupon);
  }

  async validateCoupon(id: string): Promise<void> {
    const NOW = new Date();

    const coupon = await this.findById(id);

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is inactive');
    }

    if (coupon.startsAt > NOW) {
      throw new BadRequestException('Coupon is not yet active');
    }

    if (coupon.expiresAt < NOW) {
      throw new BadRequestException('Coupon has expired');
    }
  }

  private generateCode(prefix = 'PROMO', length = 10): string {
    const random = randomBytes(length)
      .toString('hex')
      .toUpperCase()
      .slice(0, length);

    return `${prefix}-${random}`;
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;

    while (true) {
      code = this.generateCode();

      const exists = await this.couponRepository.findOne({
        where: { code },
      });

      if (!exists) break;
    }

    return code;
  }
}
