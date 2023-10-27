import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(3, 20)
  // regex pattern
  username: string;
  @IsEmail()
  @IsOptional()
  // regex pattern
  email: string;
  @IsString()
  @IsOptional()
  @Length(8, 20)
  // regex pattern
  password: string;
  @IsString()
  @IsOptional()
  firstName: string;
  @IsString()
  @IsOptional()
  lastName: string;
  @IsDateString()
  @IsOptional()
  dateOfBirth: Date;
  @IsString()
  @IsOptional()
  // regex pattern
  phone: string;
}
