
import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm';
import { Roles } from 'src/auth/roles.enum';
import { UserHobby } from '../hobby/user-hobby.entity';

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

  @OneToMany(() => UserHobby, userHobby => userHobby.user)
  hobbies: UserHobby[];
}