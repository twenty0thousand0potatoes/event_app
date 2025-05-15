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
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Hobby } from './hobby/hobby.entity';
import { UserHobby } from './hobby/user-hobby.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HobbyModule } from './hobby/hobby.module';
import { Event } from './event/event.entity';
import { EventModule } from './event/event.module';
import { ModeratorModule } from './moderator/moderator.module';
import { EventPhoto } from './event/event-photo.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'test_app',
      entities: [User, Event, Hobby, UserHobby, EventPhoto],
      synchronize: true,
    }),
    RedisModule,
    MailModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    HobbyModule,
    EventModule,
    ModeratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
