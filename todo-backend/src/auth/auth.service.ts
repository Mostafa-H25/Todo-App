// Services
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

// Entities
import { RefreshToken } from './entities/token.entity';

// Interfaces
import { IToken } from './interfaces/token.interface';
import { IPayload } from './interfaces/payload.interface';

// Constants
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from './constants/constants';

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IJwtPayload } from './interfaces/jwtPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private tokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // hash user password
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  // check if input password is the same as the one in the db
  async checkPassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }

  // generate access token
  async generateAccessToken(payload: IPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.accessSecretKey'),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  // generate refresh token
  async generateRefreshToken(payload: IPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.refreshSecretKey'),
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  // generate access and refresh tokens
  async generateTokens(payload: IPayload): Promise<IToken> {
    // generate access token
    const accessToken = await this.generateAccessToken(payload);

    // delete previous refresh token for user from db if any
    if (await this.findTokenByUserId(payload.sub)) {
      await this.removeTokenByUserId(payload.sub);
    }
    // generate refresh token
    const refreshToken = await this.generateRefreshToken(payload);
    // save refresh token in db
    await this.tokenRepository.save(
      this.tokenRepository.create({
        refreshToken,
        userId: payload.sub,
      }),
    );

    return { accessToken, refreshToken };
  }

  // decode token
  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  // verify token
  async verifyToken(token: string): Promise<IJwtPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('jwt.refreshSecretKey'),
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////

  // Get token by user id
  async findTokenByUserId(userId: string): Promise<RefreshToken | null> {
    return await this.tokenRepository.findOne({ where: { userId } });
  }

  // Remove token
  async removeToken(refreshToken: string): Promise<void> {
    await this.tokenRepository.delete({ refreshToken });
  }

  // Remove token by userId
  async removeTokenByUserId(userId: string): Promise<void> {
    await this.tokenRepository.delete({ userId });
  }
}
