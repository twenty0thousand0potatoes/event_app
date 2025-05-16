import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Event } from './event.entity';

@Entity()
@Unique(['user', 'event'])
export class EventSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.eventSubscriptions, { eager: true })
  user: User;

  @ManyToOne(() => Event, event => event.subscriptions, { eager: true })
  event: Event;

  @CreateDateColumn()
  createdAt: Date;
}
