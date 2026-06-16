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

@Module({
  imports: [
    /* Using secrets or configuration values in app */
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
      entities: [User, Address, Category, Product],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
