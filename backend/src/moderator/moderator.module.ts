import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Event } from '../event/event.entity';
import { ModeratorService } from './moderator.service';
import { ModeratorController } from './moderator.controller';
import { JwtModule } from '@nestjs/jwt';
import { RoleChangeRequest, RoleChangeRequestStatus } from 'src/users/role-change-request.entity';
import { UsersModule } from '../users/users.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, RoleChangeRequest]),
    JwtModule,
    UsersModule,
    EventModule,
  ],
  providers: [ModeratorService],
  controllers: [ModeratorController],
})
export class ModeratorModule {} 
