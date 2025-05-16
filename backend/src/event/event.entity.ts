import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { EventPhoto } from './event-photo.entity';
import { EventSubscription } from './event-subscription.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  date: Date;
 
  @Column({ type: 'int', default: 50 })
  maxParticipants: number;

  @Column({ type: 'varchar', length: 50, default: 'regular' })
  type: string;

  @Column({ type: 'float', default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mainPhotoUrl?: string;

  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @ManyToOne(() => User, user => user.events, { eager: true })
  creator: User;

  @OneToMany(() => EventPhoto, photo => photo.event, { cascade: true, eager: true })
  photos: EventPhoto[];

  @OneToMany(() => EventSubscription, subscription => subscription.event)
  subscriptions: EventSubscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
