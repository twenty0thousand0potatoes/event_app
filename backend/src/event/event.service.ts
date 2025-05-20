import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Event } from './event.entity';
import { EventPhoto } from './event-photo.entity';
import { CreateEventDto } from '../auth/dto/create-event.dto';
import { UpdateEventDto } from 'src/auth/dto/update-event.dto';
import { EventSubscription } from './event-subscription.entity';

interface EventFilters {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'date' | 'price';
  sortOrder?: 'asc' | 'desc';
}
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

  async getEventsCreatedByUser(userId: number): Promise<Event[]> {
    const eventRepository = this.dataSource.getRepository(Event);
    return eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('event.photos', 'photos')
      .where('creator.id = :userId', { userId })
      .getMany();
  }

  async getEventsSubscribedByUser(userId: number): Promise<Event[]> {
    const eventSubscriptionRepository = this.dataSource.getRepository(EventSubscription);
    const subscriptions = await eventSubscriptionRepository.find({
      where: { user: { id: userId } },
      relations: ['event', 'event.creator', 'event.photos'],
    });
    return subscriptions.map(sub => sub.event);
  }

  async getEventById(id: number): Promise<Event> {
    const eventRepository = this.dataSource.getRepository(Event);
    const event = await eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('event.photos', 'photos')
      .leftJoinAndSelect('event.subscriptions', 'subscriptions')
      .where('event.id = :id', { id })
      .getOne();

    if (!event) {
      throw new NotFoundException('Мероприятие не найдено');
    }

    return event;
  }

  async subscribeToEvent(userId: number, eventId: number): Promise<EventSubscription> {
    const eventRepository = this.dataSource.getRepository(Event);
    const subscriptionRepository = this.dataSource.getRepository(EventSubscription);
    const userRepository = this.dataSource.getRepository('User');

    const event = await eventRepository.findOne({
      where: { id: eventId },
      relations: ['subscriptions'],
    });

    if (!event) {
      throw new NotFoundException('Мероприятие не найдено');
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existingSubscription = await subscriptionRepository.findOne({
      where: { user: { id: userId }, event: { id: eventId } },
    });
    if (existingSubscription) {
      throw new ConflictException('Вы уже подписаны на это мероприятие');
    }

    if (event.subscriptions.length >= event.maxParticipants) {
      throw new ForbiddenException('Свободных мест нет');
    }

    const subscription = subscriptionRepository.create({
      user,
      event,
    });

    return subscriptionRepository.save(subscription);
  }

  async updateEvent(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const eventRepository = this.dataSource.getRepository(Event);
    const eventPhotoRepository = this.dataSource.getRepository(EventPhoto);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = await queryRunner.manager.getRepository(Event).findOne({
        where: { id },
        relations: ['photos'],
      });

      if (!event) {
        throw new NotFoundException('Мероприятие не найдено');
      }

      const { photos, ...eventData } = updateEventDto;
      Object.assign(event, eventData);

      if (photos) {
        if (event.photos && event.photos.length > 0) {
          await queryRunner.manager.getRepository(EventPhoto).remove(event.photos);
        }
        const photoEntities = photos.map(url => {
          const photo = new EventPhoto();
          photo.url = url;
          photo.event = event;
          return photo;
        });
        await queryRunner.manager.getRepository(EventPhoto).save(photoEntities);


        if (photos.length > 0) {
          event.mainPhotoUrl = photos[0];
        } else {
          event.mainPhotoUrl = null;
        }
      }

      const savedEvent = await queryRunner.manager.getRepository(Event).save(event);

      await queryRunner.commitTransaction();

      return savedEvent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createEvent(eventData: CreateEventDto, user: any): Promise<Event> {
    const maxPhotos = (user.role === 'organizer' || user.isPlusSubscriber) ? 7 : 3;
    const { photos = [], imageUrl, ...eventDataWithoutPhotos } = eventData;

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

    if (photos.length > maxPhotos) {
      throw new ForbiddenException(`Максимальное количество фото для вашего типа пользователя: ${maxPhotos}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const eventRepository = queryRunner.manager.getRepository(Event);
      const eventPhotoRepository = queryRunner.manager.getRepository(EventPhoto);

      const event = eventRepository.create({
        ...eventDataWithoutPhotos,
        creator: { id: user.sub },
        latitude: eventData.latitude,
        longitude: eventData.longitude,
      });

      const savedEvent = await eventRepository.save(event);

      if (photos.length > 0) {
        const photoEntities = photos.map(url => {
          const photo = new EventPhoto();
          photo.url = url;
          photo.event = savedEvent;
          return photo;
        });
        await eventPhotoRepository.save(photoEntities);

        if (!savedEvent.mainPhotoUrl) {
          savedEvent.mainPhotoUrl = photos[0];
          await eventRepository.save(savedEvent);
        }
      }

      await queryRunner.commitTransaction();

      const eventWithPhotos = await eventRepository.findOne({
        where: { id: savedEvent.id },
        relations: ['creator', 'photos'],
      });

      if (!eventWithPhotos) {
        throw new NotFoundException('Мероприятие не найдено');
      }

      return eventWithPhotos;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async getAllEventsWithCreators(): Promise<Event[]> {
    const eventRepository = this.dataSource.getRepository(Event);
    return eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('event.photos', 'photos')
      .getMany();
  }
}
