import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Event } from '../event/event.entity';
import { ModeratorService } from './moderator.service';
import { ModeratorController } from './moderator.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Event]), JwtModule],
  providers: [ModeratorService],
  controllers: [ModeratorController],
})
export class ModeratorModule {}
