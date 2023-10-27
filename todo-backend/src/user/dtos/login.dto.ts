import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  // regex pattern
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  // regex pattern
  password: string;
}
