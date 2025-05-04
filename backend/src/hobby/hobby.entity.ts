
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserHobby } from './user-hobby.entity';

@Entity()
export class Hobby {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => UserHobby, userHobby => userHobby.hobby)
  userConnections: UserHobby[];
}