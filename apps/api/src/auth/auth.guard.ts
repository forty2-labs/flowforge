import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC, type AuthedRequest } from './auth.decorators.js';
import { AuthService } from './auth.service.js';

export const SESSION_COOKIE = 'ff_session';

// Registered globally: every route needs a session unless marked @Public().
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const token: unknown = request.cookies?.[SESSION_COOKIE];
    const session = typeof token === 'string' ? await this.auth.resolveSession(token) : null;

    if (session) {
      request.user = session.user;
      request.sessionId = session.sessionId;
      return true;
    }
    if (isPublic) return true;
    throw new UnauthorizedException('Sign in to continue.');
  }
}
