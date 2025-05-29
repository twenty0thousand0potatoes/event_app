import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Roles } from 'src/auth/roles.enum';

export enum RoleChangeRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class RoleChangeRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.roleChangeRequests, { eager: true })
  user: User;

  @Column({
    type: 'enum',
    enum: Roles,
  })
  requestedRole: Roles;

  @Column()
  filePath: string;

  @Column({
    type: 'enum',
    enum: RoleChangeRequestStatus,
    default: RoleChangeRequestStatus.PENDING,
  })
  status: RoleChangeRequestStatus;

  @Column({ nullable: true, type: 'text' })
  moderatorComment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
