import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
} from 'typeorm';
import { Roles } from 'src/auth/roles.enum';
import { UserHobby } from '../hobby/user-hobby.entity';
import { Event } from 'src/event/event.entity';
import { EventSubscription } from 'src/event/event-subscription.entity';
import { RoleChangeRequest } from './role-change-request.entity';
import { Notification } from '../notifications/notifications.entity';

@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.USER,
  })
  role: Roles;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true, type: 'int' })
  age: number;

  @OneToMany(() => UserHobby, (userHobby) => userHobby.user)
  hobbies: UserHobby[];

  @OneToMany(() => Event, (event) => event.creator) 
  events: Event[];

  @OneToMany(() => EventSubscription, subscription => subscription.user)
  eventSubscriptions: EventSubscription[];

  @OneToMany(() => RoleChangeRequest, (request) => request.user)
  roleChangeRequests: RoleChangeRequest[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @Column({ default: false })
  isPlusSubscriber: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  plusSubscriptionExpiresAt: Date | null;
}
