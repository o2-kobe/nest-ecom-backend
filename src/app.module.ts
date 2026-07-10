import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { Address } from './address/entities/address.entity';
import { CategoryModule } from './category/category.module';
import { Category } from './category/entities/category.entity';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { InventoryModule } from './inventory/inventory.module';
import { Inventory } from './inventory/entities/inventory.entity';
import { CartModule } from './cart/cart.module';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart/entities/cartItem.entity';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';
import { Coupon } from './coupon/entities/coupon.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/orderItem.entity';
import { ReviewModule } from './review/review.module';
import { Review } from './review/entities/review.entity';
import { EventModule } from './event/event.module';
import { QueueModule } from './queue/queue.module';
import { EmailModule } from './email/email.module';
import { AuditModule } from './audit/audit.module';
import { AuditTrail } from './audit/entities/audit.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_SECRET,
      database: 'e_commerce',
      entities: [
        User,
        Address,
        Category,
        Product,
        Inventory,
        Cart,
        CartItem,
        Coupon,
        Order,
        OrderItem,
        Review,
        AuditTrail,
      ],
      synchronize: true, // Remove during prod
    }),

    // Configure Rate limitting module
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 5,
        },
      ],
    }),

    // Caching module
    CacheModule.register({
      isGlobal: true,
      ttl: 30000,
      max: 100,
    }),

    UserModule,

    AuthModule,

    AddressModule,

    CategoryModule,

    ProductsModule,

    InventoryModule,

    CartModule,

    OrderModule,

    CouponModule,

    ReviewModule,

    EventModule,

    QueueModule,

    EmailModule,

    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
