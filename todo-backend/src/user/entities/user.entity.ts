import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'user_role', enum: Role, default: Role.User })
  userRole: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ name: 'user_photo', nullable: true })
  userPhoto: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  toLower() {
    this.username = this.username.toLowerCase();
    this.email = this.email.toLowerCase();
    this.firstName = this.firstName?.toLowerCase();
    this.lastName = this.lastName?.toLowerCase();
  }
}
