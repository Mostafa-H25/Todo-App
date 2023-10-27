// Services
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Constants
import { IS_PUBLIC_KEY } from '../constants/constants';

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // check if controller or handler has the public decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // if the controller or the handler has the public decorator don't apply the auth guard
    if (isPublic) return true;

    // get request
    const request = context.switchToHttp().getRequest();
    // get access token
    const token = this.extractTokenFromHeader(request);
    // if there is no token return unauthorized
    if (!token) throw new ForbiddenException();

    // verify token
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.accessSecretKey'),
      });
      request.user = payload;
    } catch (error) {
      throw new ForbiddenException();
    }
    return true;
  }

  // extract token from request headers
  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    // check if it is a bearer token
    return type === 'Bearer' ? token : undefined;
  }
}
