// Modules
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

// Services
import { AuthService } from './auth.service';

// Strategies
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';

// Guards
import { AccessTokenGuard } from './guards/accessToken.guard';

// Entities
import { RefreshToken } from './entities/token.entity';

import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken]), JwtModule.register({})],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    { provide: 'APP_GUARD', useClass: AccessTokenGuard },
  ],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}
