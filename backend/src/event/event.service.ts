import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Event } from './event.entity';

interface EventFilters {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'date' | 'price';
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class EventService {
  constructor(
    private dataSource: DataSource,
  ) {}

  async findEvents(filters: EventFilters): Promise<Event[]> {
    const eventRepository = this.dataSource.getRepository(Event);
    let query: SelectQueryBuilder<Event> = eventRepository.createQueryBuilder('event');

    query = query.leftJoinAndSelect('event.creator', 'creator');

    if (filters.type) {
      query = query.andWhere('event.type = :type', { type: filters.type });
    }
    if (filters.minPrice !== undefined) {
      query = query.andWhere('event.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      query = query.andWhere('event.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
      query = query.orderBy(`event.${filters.sortBy}`, order);
    }

    return query.getMany();
  }

  async getEventById(id: number): Promise<Event> {
    const eventRepository = this.dataSource.getRepository(Event);
    const event = await eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .where('event.id = :id', { id })
      .getOne();

    if (!event) {
      throw new NotFoundException('Мероприятие не найдено');
    }

    return event;
  }

  async createEvent(eventData: Partial<Event>, user: any): Promise<Event> {
    const eventRepository = this.dataSource.getRepository(Event);

    if (user.role === 'user') {
      if (!user.isPlusSubscriber) {
        if (eventData.type === 'premium') {
          throw new ForbiddenException('Мероприятия типа "Премиум" доступны только для пользователей с подпиской Plus');
        }
        if (eventData.price && eventData.price > 0) {
          throw new ForbiddenException('Платные мероприятия доступны только для пользователей с подпиской Plus');
        }
      }
      if (eventData.maxParticipants && eventData.maxParticipants > 50) {
        throw new ForbiddenException('Обычные пользователи не могут создавать мероприятия с более чем 50 участниками');
      }
    }

    const event = eventRepository.create({
      ...eventData,
      creator: { id: user.sub },
      latitude: eventData.latitude,
      longitude: eventData.longitude,
    });

    return eventRepository.save(event);
  }


  async getAllEventsWithCreators(): Promise<Event[]> {
    const eventRepository = this.dataSource.getRepository(Event);
    return eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .getMany();
  }
}
