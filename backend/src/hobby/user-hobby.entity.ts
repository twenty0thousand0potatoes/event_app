
import { Entity, PrimaryGeneratedColumn, ManyToOne, Index, CreateDateColumn, Column } from 'typeorm';
import { User } from '../users/user.entity';
import { Hobby } from './hobby.entity';

@Entity()
@Index(['userId', 'hobbyId'], { unique: true }) 
export class UserHobby {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  hobbyId: number;

  @ManyToOne(() => User, user => user.hobbies)
  user: User;

  @ManyToOne(() => Hobby, hobby => hobby.userConnections)
  hobby: Hobby;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  level?: string; 
}