import { Unique, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Roles } from 'src/auth/roles.enum';

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
}
