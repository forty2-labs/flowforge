import { Body, Controller, Get, HttpCode, Param, Post, Req, Res } from '@nestjs/common';
import type { PasswordResetPreviewDto, SessionDto } from '@flowforge/types';
import type { Response } from 'express';
import { env } from '../env.js';
import { CurrentUser, Public, type AuthedRequest, type AuthUser } from './auth.decorators.js';
import { ForgotPasswordDto, ResetPasswordDto, SignInDto, SignUpDto } from './auth.dto.js';
import { SESSION_COOKIE } from './auth.guard.js';
import { AuthService, SESSION_TTL_MS } from './auth.service.js';
import { PasswordResetService } from './password-reset.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly passwordReset: PasswordResetService,
  ) {}

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

  // Always 204, so the answer does not reveal whether the account exists.
  @Public()
  @Post('password/forgot')
  @HttpCode(204)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.passwordReset.request(dto.email);
  }

  @Public()
  @Get('password/reset/:token')
  previewPasswordReset(@Param('token') token: string): Promise<PasswordResetPreviewDto> {
    return this.passwordReset.preview(token);
  }

  // Signs out every other session and signs this browser in with the new password.
  @Public()
  @Post('password/reset')
  @HttpCode(200)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SessionDto> {
    const { token, user } = await this.passwordReset.reset(dto.token, dto.password);
    setSessionCookie(response, token);
    return this.auth.describeSession(user);
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
