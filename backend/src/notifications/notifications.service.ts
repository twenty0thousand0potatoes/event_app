import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notifications.entity';
import { User } from '../users/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async findByUser(user: User): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user },
      order: { createdAt: 'DESC' },
    });
  }
}
