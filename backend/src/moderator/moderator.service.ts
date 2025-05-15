import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { User } from '../users/user.entity';
import { Event } from '../event/event.entity';

interface UserFilters {
  search?: string;
  city?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface EventFilters {
  search?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable()
export class ModeratorService {
  constructor(private dataSource: DataSource) {}

  async getUsers(filters: UserFilters): Promise<{ data: User[]; total: number }> {
    const userRepository = this.dataSource.getRepository(User);
    let query: SelectQueryBuilder<User> = userRepository.createQueryBuilder('user');

    if (filters.search) {
      query = query.andWhere('(user.username LIKE :search OR user.email LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }
    if (filters.city) {
      query = query.andWhere('user.city = :city', { city: filters.city });
    }
    if (filters.role) {
      query = query.andWhere('user.role = :role', { role: filters.role });
    }
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
      query = query.orderBy(`user.${filters.sortBy}`, order);
    } else {
      query = query.orderBy('user.id', 'ASC');
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    query = query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async getEvents(filters: EventFilters): Promise<{ data: Event[]; total: number }> {
    const eventRepository = this.dataSource.getRepository(Event);
    let query: SelectQueryBuilder<Event> = eventRepository.createQueryBuilder('event');

    query = query.leftJoinAndSelect('event.creator', 'creator');

    if (filters.search) {
      query = query.andWhere('(event.title LIKE :search OR event.description LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }
    if (filters.type) {
      query = query.andWhere('event.type = :type', { type: filters.type });
    }
    if (filters.dateFrom) {
      query = query.andWhere('event.date >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters.dateTo) {
      query = query.andWhere('event.date <= :dateTo', { dateTo: filters.dateTo });
    }
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
      query = query.orderBy(`event.${filters.sortBy}`, order);
    } else {
      query = query.orderBy('event.date', 'DESC');
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    query = query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }
}
