// Services
import { UserService } from './user.service';

// Guards
import { ConfirmPasswordGuard } from './guards/confirm-password.guard';

// Decorators
import { Public } from 'src/auth/decorators/public.decorator';

// DTOs
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokenGuard } from 'src/auth/guards/refreshToken.guard';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post('register')
  @UseGuards(ConfirmPasswordGuard)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    return await this.userService.createUser(createUserDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.userService.login(loginDto);
  }

  @Public()
  @Get('verify/:token')
  @HttpCode(HttpStatus.OK)
  async verifyAccount(
    @Param('token') verificationToken: string,
  ): Promise<void> {
    return await this.userService.verifyAccount(verificationToken);
  }

  @Public()
  @Post('change-password-request')
  @HttpCode(HttpStatus.OK)
  async changePasswordRequest(@Body() data: { email: string }): Promise<void> {
    return await this.userService.changePasswordRequest(data.email);
  }

  @Public()
  @Post('change-password/:token')
  @UseGuards(ConfirmPasswordGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() createUserDto: CreateUserDto): Promise<void> {
    return await this.userService.changePassword(createUserDto);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(@Req() request: Request): Promise<string> {
    const refreshToken =
      request.get('Authorization')?.replace('Bearer ', '').trim() || '';
    if (refreshToken)
      return await this.userService.refreshAccessToken(refreshToken);
    throw new ForbiddenException();
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request): Promise<void> {
    const refreshToken =
      request.get('Authorization')?.replace('Bearer ', '').trim() || '';
    if (refreshToken) return await this.userService.logout(refreshToken);
    throw new HttpException(
      'Refresh token is not registered.',
      HttpStatus.NOT_FOUND,
    );
  }
}
