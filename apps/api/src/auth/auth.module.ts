import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { MailModule } from '../mail/mail.module.js';
import { PasswordResetService } from './password-reset.service.js';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetService, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [AuthService],
})
export class AuthModule {}
