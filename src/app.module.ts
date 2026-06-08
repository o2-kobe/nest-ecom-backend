import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './user/user.module';

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
      database: 'e_commerce', //database name to be configured in pgAdmin
      entities: [], // Entities needed to be registered in the db
      synchronize: true, //Only used in development ?? Remove during prod
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
