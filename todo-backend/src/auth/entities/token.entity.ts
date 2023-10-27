// Entities
import { User } from 'src/user/entities/user.entity';

import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryColumn({ name: 'refresh_token' })
  refreshToken: string;

  @OneToOne(() => User, (user) => user.userId)
  @JoinColumn()
  userId: string;
}
