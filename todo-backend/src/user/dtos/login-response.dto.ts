import { User } from '../entities/user.entity';

export class LoginResponseDto {
  user: Pick<
    User,
    | 'username'
    | 'email'
    | 'firstName'
    | 'lastName'
    | 'userPhoto'
    | 'dateOfBirth'
    | 'phone'
  >;
  accessToken: string;
  refreshToken: string;
}
