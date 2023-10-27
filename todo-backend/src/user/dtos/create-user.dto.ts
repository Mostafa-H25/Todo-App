import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  // regex pattern
  username: string;
  @IsEmail()
  // regex pattern
  email: string;
  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  // regex pattern
  password: string;
  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  // regex pattern
  confirmPassword: string;
  @IsString()
  @IsOptional()
  firstName: string;
  @IsString()
  @IsOptional()
  lastName: string;
  @IsDateString()
  dateOfBirth: Date;
  @IsString()
  @IsOptional()
  // regex pattern
  phone: string;
}
