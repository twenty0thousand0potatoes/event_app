import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Event } from './event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), JwtModule],
  providers: [EventService],
  controllers: [EventController]
})
export class EventModule {}
  