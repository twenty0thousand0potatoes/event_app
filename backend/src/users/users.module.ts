import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Hobby } from 'src/hobby/hobby.entity';
import { UserHobby } from 'src/hobby/user-hobby.entity';
import { StripeService } from 'src/stripe/stripe.service';
import { RoleChangeRequest, RoleChangeRequestStatus } from './role-change-request.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User, Hobby, UserHobby, RoleChangeRequest]), JwtModule],
  providers: [UsersService, StripeService],
  controllers: [UsersController],
  exports :[UsersService]
})
export class UsersModule {}
