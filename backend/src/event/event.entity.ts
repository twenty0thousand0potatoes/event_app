import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

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
  imageUrl?: string;

  @ManyToOne(() => User, user => user.events, { eager: true })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
