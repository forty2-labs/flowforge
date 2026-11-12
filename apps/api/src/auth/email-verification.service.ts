import { GoneException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { EmailVerifiedDto } from '@flowforge/types';
import { hashToken, newToken } from '../common/tokens.js';
import { env } from '../env.js';
import { MailerService } from '../mail/mailer.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
// Resend requests within this window send nothing, so the button cannot be
// used to flood an inbox.
const RESEND_COOLDOWN_MS = 60 * 1000;

interface Recipient {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  // Replaces any earlier link with a new one and emails it. A failed delivery
  // is logged, not thrown: the person can ask for another from the app.
  async send(user: Recipient): Promise<void> {
    const { token, tokenHash } = newToken();
    await this.prisma.$transaction([
      // Only the newest link works.
      this.prisma.emailVerification.deleteMany({ where: { userId: user.id } }),
      this.prisma.emailVerification.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
        },
      }),
    ]);

    const verifyUrl = `${env.webOrigin}/verify-email/${token}`;
    const result = await this.mailer.send({
      to: user.email,
      subject: 'Confirm your email for Flowforge',
      text: [
        `Hi ${user.name},`,
        '',
        'Confirm this is your email address to finish setting up your Flowforge account.',
        `Confirm your email: ${verifyUrl}`,
        '',
        'The link works for 24 hours.',
        "If you didn't create a Flowforge account, you can ignore this email.",
      ].join('\n'),
    });
    if (result === 'failed') {
      this.logger.warn(`Verification email to user ${user.id} was not delivered.`);
    }
  }

  // For the "Resend email" button. Does nothing once the email is verified,
  // or if a link was sent within the last minute.
  async resend(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.emailVerifiedAt) return;
    const recent = await this.prisma.emailVerification.findFirst({
      where: { userId, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
    });
    if (recent) return;
    await this.send(user);
  }

  // Public, so the link works in any browser, signed in or not.
  async verify(token: string): Promise<EmailVerifiedDto> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!verification) {
      throw new NotFoundException('This confirmation link is no longer valid.');
    }
    if (verification.expiresAt.getTime() <= Date.now()) {
      throw new GoneException('This confirmation link has expired. Ask for a new one.');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerifiedAt: verification.user.emailVerifiedAt ?? new Date() },
      }),
      this.prisma.emailVerification.deleteMany({ where: { userId: verification.userId } }),
    ]);
    return { email: verification.user.email };
  }
}
