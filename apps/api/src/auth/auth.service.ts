import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { SessionDto } from '@flowforge/types';
import { hashToken, newToken } from '../common/tokens.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailVerificationService } from './email-verification.service.js';
import type { AuthUser } from './auth.decorators.js';
import type { SignInDto, SignUpDto } from './auth.dto.js';
import { hashPassword, verifyPassword } from './password.js';

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  async signUp(dto: SignUpDto): Promise<{ token: string; user: AuthUser }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email,
        passwordHash: await hashPassword(dto.password),
      },
    });
    await this.emailVerification.send(user);
    return this.startSession(user);
  }

  async signIn(dto: SignInDto): Promise<{ token: string; user: AuthUser }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Same message for an unknown email and a wrong password.
    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }
    return this.startSession(user);
  }

  async signOut(sessionId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id: sessionId } });
  }

  async resolveSession(token: string): Promise<{ sessionId: string; user: AuthUser } | null> {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!session) return null;
    if (session.expiresAt.getTime() <= Date.now()) {
      await this.prisma.session.deleteMany({ where: { id: session.id } });
      return null;
    }
    return { sessionId: session.id, user: toAuthUser(session.user) };
  }

  async describeSession(user: AuthUser): Promise<SessionDto> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });
    return {
      user,
      workspaces: memberships.map((membership) => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
        role: membership.role,
      })),
    };
  }

  async startSession(user: UserRecord): Promise<{ token: string; user: AuthUser }> {
    const { token, tokenHash } = newToken();
    await this.prisma.session.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
    });
    return { token, user: toAuthUser(user) };
  }
}

// The User columns an AuthUser is built from.
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  emailVerifiedAt: Date | null;
}

function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerifiedAt !== null,
  };
}
