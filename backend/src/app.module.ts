import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { MailModule } from './mail/mail.module';
import { RedisModule as RedisMod } from '@nestjs-modules/ioredis';
import { RedisModule } from './redis/redis.module';


@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type:"postgres",
      host:'localhost',
      port:5432,
      username:'postgres',
      password:'password',
      database:'test_app',
      entities: [User],
      synchronize: true,
    }),
    RedisModule, MailModule
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}
