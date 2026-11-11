import { GoneException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { PasswordResetPreviewDto } from '@flowforge/types';
import { hashToken, newToken } from '../common/tokens.js';
import { env } from '../env.js';
import { MailerService } from '../mail/mailer.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from './auth.decorators.js';
import { AuthService } from './auth.service.js';
import { hashPassword } from './password.js';

const RESET_TTL_MS = 60 * 60 * 1000;
// Repeated requests within this window send nothing, so the endpoint cannot
// be used to flood someone's inbox.
const RESEND_COOLDOWN_MS = 60 * 1000;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly auth: AuthService,
  ) {}

  // Answers the same way whether or not the account exists. The caller never
  // learns which, or whether the email went out.
  async request(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const recent = await this.prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) },
      },
    });
    if (recent) return;

    const { token, tokenHash } = newToken();
    await this.prisma.$transaction([
      // Only the newest link works.
      this.prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
      this.prisma.passwordReset.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
      }),
    ]);

    const resetUrl = `${env.webOrigin}/reset-password/${token}`;
    const result = await this.mailer.send({
      to: user.email,
      subject: 'Reset your Flowforge password',
      text: [
        `Hi ${user.name},`,
        '',
        'We received a request to reset the password for your Flowforge account.',
        `Choose a new password: ${resetUrl}`,
        '',
        'The link works for 1 hour and can be used once.',
        "If you didn't ask for this, you can ignore this email. Your password stays the same.",
      ].join('\n'),
    });
    if (result === 'failed') {
      this.logger.warn(`Password reset email to user ${user.id} was not delivered.`);
    }
  }

  async preview(token: string): Promise<PasswordResetPreviewDto> {
    const reset = await this.findByToken(token);
    return { email: reset.user.email, expired: isExpired(reset.expiresAt) };
  }

  // Sets the new password, signs out every existing session and starts a new one.
  async reset(token: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const reset = await this.findByToken(token);
    if (isExpired(reset.expiresAt)) {
      throw new GoneException('This reset link has expired. Ask for a new one.');
    }
    const passwordHash = await hashPassword(password);
    await this.prisma.$transaction(async (tx) => {
      // Conditional on usedAt, so two requests racing with one link cannot
      // both win. The loser throws, which rolls back its password change.
      const claimed = await tx.passwordReset.updateMany({
        where: { id: reset.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw new NotFoundException('This reset link is no longer valid.');
      }
      await tx.user.update({ where: { id: reset.userId }, data: { passwordHash } });
      await tx.session.deleteMany({ where: { userId: reset.userId } });
    });
    return this.auth.startSession(reset.user);
  }

  private async findByToken(token: string) {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!reset || reset.usedAt) {
      throw new NotFoundException('This reset link is no longer valid.');
    }
    return reset;
  }
}

function isExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}
