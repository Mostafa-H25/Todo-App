import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ConfirmPasswordGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // get request
    const request = context.switchToHttp().getRequest();
    const user = request.body;

    // check if password and the confirm password match
    if (user.password === user.confirmPassword) {
      return true;
    }
    return false;
  }
}
