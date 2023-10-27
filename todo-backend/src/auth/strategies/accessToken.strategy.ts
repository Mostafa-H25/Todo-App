// Services
import { ConfigService } from '@nestjs/config';

// Interfaces
import { IPayload } from '../interfaces/payload.interface';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.accessSecretKey'),
      ignoreExpiration: false,
    });
  }

  validate(payload: IPayload) {
    return payload;
  }
}
