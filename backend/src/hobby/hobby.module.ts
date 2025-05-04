import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Hobby } from './hobby.entity'
import { HobbyService } from './hobby.service'
import { HobbyController } from './hobby.controller'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [TypeOrmModule.forFeature([Hobby]), JwtModule],
  controllers: [HobbyController],
  providers: [HobbyService],
  exports: [HobbyService],
})
export class HobbyModule {}
