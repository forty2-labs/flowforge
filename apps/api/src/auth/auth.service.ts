import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { SessionDto } from '@flowforge/types';
import { hashToken, newToken } from '../common/tokens.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { EmailVerificationService } from './email-verification.service.js';
import type { GoogleProfile } from './supabase-auth.service.js';
import type { AuthUser } from './auth.decorators.js';
import type { SignInDto, SignUpDto } from './auth.dto.js';
import { hashPassword, verifyPassword } from './password.js';

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const GOOGLE = 'google';

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
    // Same message for an unknown email, a wrong password and an account that
    // only signs in with Google.
    if (!user?.passwordHash || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }
    return this.startSession(user);
  }

  // Finds the account by its Google link, then by email, and creates one if
  // neither exists. Retries once if a parallel sign-in created it first.
  async signInWithGoogle(
    profile: GoogleProfile,
    retry = true,
  ): Promise<{ token: string; user: AuthUser }> {
    try {
      return await this.startSession(await this.findOrCreateGoogleUser(profile));
    } catch (error) {
      if (retry && isUniqueViolation(error)) return this.signInWithGoogle(profile, false);
      throw error;
    }
  }

  private async findOrCreateGoogleUser(profile: GoogleProfile): Promise<UserRecord> {
    const identity = { provider: GOOGLE, subject: profile.subject, email: profile.email };
    const linked = await this.prisma.authIdentity.findUnique({
      where: { provider_subject: { provider: GOOGLE, subject: profile.subject } },
      include: { user: true },
    });
    if (linked) {
      const { user } = linked;
      if (!user.emailVerifiedAt && profile.emailVerified && profile.email === user.email) {
        return this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerifiedAt: new Date() },
        });
      }
      return user;
    }

    const existing = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (existing) {
      // Otherwise a Google account holding someone else's address could take over their account.
      if (!profile.emailVerified) {
        throw new ConflictException(
          'An account with this email already exists, and Google hasn’t confirmed the address. Sign in with your password instead.',
        );
      }
      if (existing.emailVerifiedAt) {
        await this.prisma.authIdentity.create({ data: { ...identity, userId: existing.id } });
        return existing;
      }
      // Nobody proved they own this address when the password was set, so it
      // may have been someone else. Google has now proved it: the password and
      // every way into the account that came with it stop working.
      const [, user] = await this.prisma.$transaction([
        this.prisma.authIdentity.create({ data: { ...identity, userId: existing.id } }),
        this.prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash: null, emailVerifiedAt: new Date() },
        }),
        this.prisma.session.deleteMany({ where: { userId: existing.id } }),
        this.prisma.passwordReset.deleteMany({ where: { userId: existing.id } }),
        this.prisma.emailVerification.deleteMany({ where: { userId: existing.id } }),
      ]);
      return user;
    }

    const user = await this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        emailVerifiedAt: profile.emailVerified ? new Date() : null,
        identities: { create: identity },
      },
    });
    if (!profile.emailVerified) await this.emailVerification.send(user);
    return user;
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

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
