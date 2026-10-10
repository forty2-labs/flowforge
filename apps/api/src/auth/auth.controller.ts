import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { SessionDto } from '@flowforge/types';
import type { Response } from 'express';
import { env } from '../env.js';
import { CurrentUser, Public, type AuthedRequest, type AuthUser } from './auth.decorators.js';
import { SignInDto, SignUpDto } from './auth.dto.js';
import { SESSION_COOKIE } from './auth.guard.js';
import { AuthService, SESSION_TTL_MS } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('signup')
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SessionDto> {
    const { token, user } = await this.auth.signUp(dto);
    setSessionCookie(response, token);
    return this.auth.describeSession(user);
  }

  @Public()
  @Post('signin')
  @HttpCode(200)
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SessionDto> {
    const { token, user } = await this.auth.signIn(dto);
    setSessionCookie(response, token);
    return this.auth.describeSession(user);
  }

  @Post('signout')
  @HttpCode(204)
  async signOut(
    @Req() request: AuthedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    if (request.sessionId) await this.auth.signOut(request.sessionId);
    response.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<SessionDto> {
    return this.auth.describeSession(user);
  }
}

function setSessionCookie(response: Response, token: string): void {
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}
