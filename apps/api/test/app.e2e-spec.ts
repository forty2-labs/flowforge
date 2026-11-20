import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { decodeJwt, SignJWT } from 'jose';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import {
  SupabaseUserClient,
  type SupabaseUser,
} from './../src/auth/supabase-auth.service.js';
import { configureApp } from './../src/configure-app.js';
import { MailerService, type Mail } from './../src/mail/mailer.service.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

// Stands in for Supabase's GET /auth/v1/user, keyed by the token's subject.
const supabaseUsers = new Map<string, SupabaseUser>();
const fakeSupabaseUsers = {
  get: async (_config: unknown, accessToken: string) =>
    supabaseUsers.get(decodeJwt(accessToken).sub ?? '') ?? null,
};

describe('Foundations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SupabaseUserClient)
      .useValue(fakeSupabaseUsers)
      .compile();
    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "AuthIdentity", "EmailVerification", "PasswordReset", "Invitation", "Membership", "Session", "Workspace", "User" CASCADE',
    );
    supabaseUsers.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  // Most tests need a verified account; pass verified: false to skip that step.
  const signUp = async (name: string, email: string, { verified = true } = {}) => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/auth/signup').send({ name, email, password: 'northstar2026' }).expect(201);
    if (verified) {
      await prisma.user.update({
        where: { email: email.trim().toLowerCase() },
        data: { emailVerifiedAt: new Date() },
      });
    }
    return agent;
  };

  it('answers the health check without a session', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' });
  });

  it('rejects requests without a session', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
    await request(app.getHttpServer()).post('/workspaces').send({ name: 'Nope' }).expect(401);
  });

  it('signs up, signs out and signs back in', async () => {
    const agent = await signUp('Maya Okafor', 'Maya@Northstar.studio');
    const me = await agent.get('/auth/me').expect(200);
    expect(me.body.user).toMatchObject({ name: 'Maya Okafor', email: 'maya@northstar.studio' });
    expect(me.body.workspaces).toEqual([]);

    await agent.post('/auth/signout').expect(204);
    await agent.get('/auth/me').expect(401);

    await agent
      .post('/auth/signin')
      .send({ email: 'maya@northstar.studio', password: 'wrong-password' })
      .expect(401);
    await agent
      .post('/auth/signin')
      .send({ email: 'maya@northstar.studio', password: 'northstar2026' })
      .expect(200);
    await agent.get('/auth/me').expect(200);
  });

  it('rejects a duplicate email and a short password', async () => {
    await signUp('Maya Okafor', 'maya@northstar.studio');
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ name: 'Other', email: 'maya@northstar.studio', password: 'northstar2026' })
      .expect(409);
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ name: 'Tom', email: 'tom@northstar.studio', password: 'short' })
      .expect(400);
  });

  it('creates workspaces with unique slugs and hides them from non-members', async () => {
    const maya = await signUp('Maya Okafor', 'maya@northstar.studio');
    const first = await maya.post('/workspaces').send({ name: 'Northstar Studio' }).expect(201);
    const second = await maya.post('/workspaces').send({ name: 'Northstar Studio' }).expect(201);
    expect(first.body).toMatchObject({ slug: 'northstar-studio', role: 'OWNER' });
    expect(second.body.slug).toBe('northstar-studio-2');

    const stranger = await signUp('Sam Whitfield', 'sam@elsewhere.co');
    await stranger.get('/workspaces/northstar-studio').expect(404);
    await stranger.get('/workspaces/northstar-studio/members').expect(404);
  });

  it('invites a teammate who accepts and gets the invited role', async () => {
    const maya = await signUp('Maya Okafor', 'maya@northstar.studio');
    await maya.post('/workspaces').send({ name: 'Northstar Studio' }).expect(201);

    const invitation = await maya
      .post('/workspaces/northstar-studio/invitations')
      .send({ email: 'tom@northstar.studio', role: 'AUTHOR' })
      .expect(201);
    // Tests run without a mail provider, so the link is logged, not emailed.
    expect(invitation.body.emailSent).toBe(false);
    const token = (invitation.body.acceptUrl as string).split('/invite/')[1];

    const preview = await request(app.getHttpServer()).get(`/invitations/${token}`).expect(200);
    expect(preview.body).toMatchObject({
      email: 'tom@northstar.studio',
      role: 'AUTHOR',
      workspaceName: 'Northstar Studio',
      expired: false,
    });

    // Someone else holding the link cannot use it.
    const sam = await signUp('Sam Whitfield', 'sam@elsewhere.co');
    await sam.post(`/invitations/${token}/accept`).expect(403);

    const tom = await signUp('Tom Becker', 'tom@northstar.studio');
    const accepted = await tom.post(`/invitations/${token}/accept`).expect(200);
    expect(accepted.body).toMatchObject({ slug: 'northstar-studio', role: 'AUTHOR' });

    // The link is single use.
    await tom.post(`/invitations/${token}/accept`).expect(404);

    const members = await tom.get('/workspaces/northstar-studio/members').expect(200);
    expect(members.body.map((member: { role: string }) => member.role)).toEqual(['OWNER', 'AUTHOR']);
  });

  it('enforces roles on team management', async () => {
    const maya = await signUp('Maya Okafor', 'maya@northstar.studio');
    await maya.post('/workspaces').send({ name: 'Northstar Studio' }).expect(201);
    const invitation = await maya
      .post('/workspaces/northstar-studio/invitations')
      .send({ email: 'tom@northstar.studio', role: 'AUTHOR' })
      .expect(201);
    const tom = await signUp('Tom Becker', 'tom@northstar.studio');
    await tom.post(`/invitations/${invitation.body.acceptUrl.split('/invite/')[1]}/accept`).expect(200);

    const members = await maya.get('/workspaces/northstar-studio/members').expect(200);
    const [mayaMember, tomMember] = members.body as Array<{ userId: string }>;

    // An Author cannot invite, rename or change roles.
    await tom
      .post('/workspaces/northstar-studio/invitations')
      .send({ email: 'x@northstar.studio', role: 'VIEWER' })
      .expect(403);
    await tom.patch('/workspaces/northstar-studio').send({ name: 'Renamed' }).expect(403);
    await tom
      .patch(`/workspaces/northstar-studio/members/${tomMember.userId}`)
      .send({ role: 'ADMIN' })
      .expect(403);

    // Inviting as Owner is not offered.
    await maya
      .post('/workspaces/northstar-studio/invitations')
      .send({ email: 'x@northstar.studio', role: 'OWNER' })
      .expect(400);

    // The only Owner cannot be demoted or removed.
    await maya
      .patch(`/workspaces/northstar-studio/members/${mayaMember.userId}`)
      .send({ role: 'ADMIN' })
      .expect(409);
    await maya.delete(`/workspaces/northstar-studio/members/${mayaMember.userId}`).expect(409);

    // An Admin cannot touch the Owner; the Owner can promote and remove.
    await maya
      .patch(`/workspaces/northstar-studio/members/${tomMember.userId}`)
      .send({ role: 'ADMIN' })
      .expect(204);
    await tom
      .patch(`/workspaces/northstar-studio/members/${mayaMember.userId}`)
      .send({ role: 'EDITOR' })
      .expect(403);
    await tom.delete(`/workspaces/northstar-studio/members/${mayaMember.userId}`).expect(403);

    // Anyone can leave.
    await tom.delete(`/workspaces/northstar-studio/members/${tomMember.userId}`).expect(204);
    await tom.get('/workspaces/northstar-studio').expect(404);
  });

  it('revokes and replaces invitations', async () => {
    const maya = await signUp('Maya Okafor', 'maya@northstar.studio');
    await maya.post('/workspaces').send({ name: 'Northstar Studio' }).expect(201);
    const invite = () =>
      maya
        .post('/workspaces/northstar-studio/invitations')
        .send({ email: 'tom@northstar.studio', role: 'EDITOR' })
        .expect(201);

    const first = await invite();
    const second = await invite();
    const firstToken = first.body.acceptUrl.split('/invite/')[1];
    const secondToken = second.body.acceptUrl.split('/invite/')[1];

    // Re-inviting the same address invalidates the earlier link.
    await request(app.getHttpServer()).get(`/invitations/${firstToken}`).expect(404);
    const pending = await maya.get('/workspaces/northstar-studio/invitations').expect(200);
    expect(pending.body).toHaveLength(1);

    await maya.delete(`/workspaces/northstar-studio/invitations/${second.body.id}`).expect(204);
    await request(app.getHttpServer()).get(`/invitations/${secondToken}`).expect(404);
  });

  describe('password reset', () => {
    let sent: Mail[];

    beforeEach(() => {
      sent = [];
      // Only reset emails: sign-up also sends a verification email.
      vi.spyOn(app.get(MailerService), 'send').mockImplementation(async (mail) => {
        if (mail.subject.startsWith('Reset')) sent.push(mail);
        return 'logged';
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const requestReset = (email: string) =>
      request(app.getHttpServer()).post('/auth/password/forgot').send({ email }).expect(204);
    const tokenFrom = (mail: Mail) => mail.text.match(/\/reset-password\/([\w-]+)/)![1];

    it('resets the password, signs out other sessions and signs this browser in', async () => {
      const oldSession = await signUp('Maya Okafor', 'maya@northstar.studio');

      await requestReset('Maya@Northstar.studio ');
      expect(sent).toHaveLength(1);
      expect(sent[0].to).toBe('maya@northstar.studio');
      const token = tokenFrom(sent[0]);

      const preview = await request(app.getHttpServer())
        .get(`/auth/password/reset/${token}`)
        .expect(200);
      expect(preview.body).toEqual({ email: 'maya@northstar.studio', expired: false });

      const browser = request.agent(app.getHttpServer());
      const reset = await browser
        .post('/auth/password/reset')
        .send({ token, password: 'new-password-2026' })
        .expect(200);
      expect(reset.body.user.email).toBe('maya@northstar.studio');
      await browser.get('/auth/me').expect(200);
      await oldSession.get('/auth/me').expect(401);

      const signIn = (password: string) =>
        request(app.getHttpServer())
          .post('/auth/signin')
          .send({ email: 'maya@northstar.studio', password });
      await signIn('northstar2026').expect(401);
      await signIn('new-password-2026').expect(200);

      // A link works once.
      await request(app.getHttpServer())
        .post('/auth/password/reset')
        .send({ token, password: 'another-password' })
        .expect(404);
    });

    it('answers the same for an unknown email and sends nothing', async () => {
      await requestReset('nobody@northstar.studio');
      expect(sent).toHaveLength(0);
    });

    it('sends one email for repeated requests within a minute', async () => {
      await signUp('Maya Okafor', 'maya@northstar.studio');
      await requestReset('maya@northstar.studio');
      await requestReset('maya@northstar.studio');
      expect(sent).toHaveLength(1);
    });

    it('keeps only the newest link working', async () => {
      await signUp('Maya Okafor', 'maya@northstar.studio');
      await requestReset('maya@northstar.studio');
      const first = tokenFrom(sent[0]);
      // Move the first request out of the cooldown window.
      await prisma.passwordReset.updateMany({
        data: { createdAt: new Date(Date.now() - 2 * 60 * 1000) },
      });
      await requestReset('maya@northstar.studio');
      expect(sent).toHaveLength(2);

      await request(app.getHttpServer()).get(`/auth/password/reset/${first}`).expect(404);
      await request(app.getHttpServer())
        .get(`/auth/password/reset/${tokenFrom(sent[1])}`)
        .expect(200);
    });

    it('refuses an expired link and a short password', async () => {
      await signUp('Maya Okafor', 'maya@northstar.studio');
      await requestReset('maya@northstar.studio');
      const token = tokenFrom(sent[0]);

      await request(app.getHttpServer())
        .post('/auth/password/reset')
        .send({ token, password: 'short' })
        .expect(400);

      await prisma.passwordReset.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
      const preview = await request(app.getHttpServer())
        .get(`/auth/password/reset/${token}`)
        .expect(200);
      expect(preview.body.expired).toBe(true);
      await request(app.getHttpServer())
        .post('/auth/password/reset')
        .send({ token, password: 'new-password-2026' })
        .expect(410);
    });
  });

  describe('email verification', () => {
    let sent: Mail[];

    beforeEach(() => {
      sent = [];
      vi.spyOn(app.get(MailerService), 'send').mockImplementation(async (mail) => {
        sent.push(mail);
        return 'logged';
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const tokenFrom = (mail: Mail) => mail.text.match(/\/verify-email\/([\w-]+)/)![1];
    const verify = (token: string) =>
      request(app.getHttpServer()).post('/auth/email/verify').send({ token });

    it('emails a link at sign-up that verifies the account once', async () => {
      const maya = await signUp('Maya Okafor', 'maya@northstar.studio', { verified: false });
      expect((await maya.get('/auth/me').expect(200)).body.user.emailVerified).toBe(false);
      expect(sent).toHaveLength(1);
      expect(sent[0].to).toBe('maya@northstar.studio');

      // Works without a session, so the link can be opened in any browser.
      const token = tokenFrom(sent[0]);
      expect((await verify(token).expect(200)).body).toEqual({ email: 'maya@northstar.studio' });
      expect((await maya.get('/auth/me').expect(200)).body.user.emailVerified).toBe(true);
      await verify(token).expect(404);
    });

    it('refuses an expired link', async () => {
      await signUp('Maya Okafor', 'maya@northstar.studio', { verified: false });
      await prisma.emailVerification.updateMany({
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      await verify(tokenFrom(sent[0])).expect(410);
    });

    it('resends with a one-minute cooldown, and only the newest link works', async () => {
      const maya = await signUp('Maya Okafor', 'maya@northstar.studio', { verified: false });
      await maya.post('/auth/email/resend').expect(204);
      expect(sent).toHaveLength(1);

      await prisma.emailVerification.updateMany({
        data: { createdAt: new Date(Date.now() - 2 * 60 * 1000) },
      });
      await maya.post('/auth/email/resend').expect(204);
      expect(sent).toHaveLength(2);
      await verify(tokenFrom(sent[0])).expect(404);
      await verify(tokenFrom(sent[1])).expect(200);

      // Nothing to send once verified.
      await prisma.emailVerification.updateMany({
        data: { createdAt: new Date(Date.now() - 2 * 60 * 1000) },
      });
      await maya.post('/auth/email/resend').expect(204);
      expect(sent).toHaveLength(2);
      await request(app.getHttpServer()).post('/auth/email/resend').expect(401);
    });

    it('requires a verified email to accept an invitation', async () => {
      const maya = await signUp('Maya Okafor', 'maya@northstar.studio');
      await maya.post('/workspaces').send({ name: 'Northstar Studio' }).expect(201);
      const invitation = await maya
        .post('/workspaces/northstar-studio/invitations')
        .send({ email: 'tom@northstar.studio', role: 'AUTHOR' })
        .expect(201);
      const token = (invitation.body.acceptUrl as string).split('/invite/')[1];

      sent = [];
      const tom = await signUp('Tom Reyes', 'tom@northstar.studio', { verified: false });
      const refused = await tom.post(`/invitations/${token}/accept`).expect(403);
      expect(refused.body.message).toMatch(/Confirm your email/);

      await verify(tokenFrom(sent[0])).expect(200);
      await tom.post(`/invitations/${token}/accept`).expect(200);
    });

    it('counts a password reset as verifying the email', async () => {
      await signUp('Maya Okafor', 'maya@northstar.studio', { verified: false });
      const signUpLink = tokenFrom(sent[0]);
      await request(app.getHttpServer())
        .post('/auth/password/forgot')
        .send({ email: 'maya@northstar.studio' })
        .expect(204);
      const resetToken = sent[1].text.match(/\/reset-password\/([\w-]+)/)![1];

      const browser = request.agent(app.getHttpServer());
      const reset = await browser
        .post('/auth/password/reset')
        .send({ token: resetToken, password: 'new-password-2026' })
        .expect(200);
      expect(reset.body.user.emailVerified).toBe(true);
      // The sign-up link is no longer needed.
      await verify(signUpLink).expect(404);
    });
  });

  describe('Google sign-in', () => {
    const ISSUER = `${process.env.SUPABASE_URL}/auth/v1`;
    const SECRET = process.env.SUPABASE_JWT_SECRET!;
    let sent: Mail[];

    beforeEach(() => {
      sent = [];
      vi.spyOn(app.get(MailerService), 'send').mockImplementation(async (mail) => {
        sent.push(mail);
        return 'logged';
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    interface GoogleAccount {
      email: string;
      googleSub?: string;
      name?: string;
      verified?: boolean;
    }

    // Registers the account with the fake Supabase and signs a token for it,
    // as Supabase does after a Google sign-in.
    const googleToken = async (
      account: GoogleAccount,
      jwt: { secret?: string; issuer?: string; expiresIn?: string; audience?: string } = {},
    ) => {
      const supabaseId = `sb-${account.googleSub ?? account.email}`;
      supabaseUsers.set(supabaseId, {
        id: supabaseId,
        email: account.email,
        identities: [
          {
            provider: 'google',
            identity_data: {
              sub: account.googleSub ?? `g-${account.email}`,
              email: account.email,
              email_verified: account.verified ?? true,
              full_name: account.name ?? 'Maya Okafor',
            },
          },
        ],
      });
      return new SignJWT({ email: account.email, role: 'authenticated' })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(supabaseId)
        .setIssuer(jwt.issuer ?? ISSUER)
        .setAudience(jwt.audience ?? 'authenticated')
        .setIssuedAt()
        .setExpirationTime(jwt.expiresIn ?? '1h')
        .sign(new TextEncoder().encode(jwt.secret ?? SECRET));
    };

    const google = (accessToken: string, agent = request.agent(app.getHttpServer())) =>
      agent.post('/auth/google').send({ accessToken });

    it('signs up a new person who lands signed in, verified and without a password', async () => {
      const browser = request.agent(app.getHttpServer());
      const answer = await google(
        await googleToken({ email: 'Maya@Northstar.studio', name: 'Maya Okafor' }),
        browser,
      ).expect(200);
      expect(answer.body.user).toMatchObject({
        name: 'Maya Okafor',
        email: 'maya@northstar.studio',
        emailVerified: true,
      });
      expect((await browser.get('/auth/me').expect(200)).body.user.email).toBe(
        'maya@northstar.studio',
      );
      const user = await prisma.user.findUniqueOrThrow({ where: { email: 'maya@northstar.studio' } });
      expect(user.passwordHash).toBeNull();
      expect(sent).toHaveLength(0);

      // No password to sign in with, and the answer gives nothing away.
      const refused = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'maya@northstar.studio', password: 'anything-at-all' })
        .expect(401);
      expect(refused.body.message).toBe('Email or password is incorrect.');
    });

    it('signs a returning person in to the same account', async () => {
      const first = await google(await googleToken({ email: 'maya@northstar.studio' })).expect(200);
      const second = await google(await googleToken({ email: 'maya@northstar.studio' })).expect(200);
      expect(second.body.user.id).toBe(first.body.user.id);
      expect(await prisma.user.count()).toBe(1);
      expect(await prisma.authIdentity.count()).toBe(1);
    });

    it('links a verified Google email to an existing verified account', async () => {
      const password = await signUp('Maya Okafor', 'maya@northstar.studio');
      const before = (await password.get('/auth/me').expect(200)).body.user.id;

      const answer = await google(await googleToken({ email: 'maya@northstar.studio' })).expect(200);
      expect(answer.body.user.id).toBe(before);
      expect(await prisma.user.count()).toBe(1);

      // The password still works, and so does the earlier session.
      await password.get('/auth/me').expect(200);
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'maya@northstar.studio', password: 'northstar2026' })
        .expect(200);
    });

    it('takes over an unverified account for the Google owner and drops its password', async () => {
      // Someone signed up with Maya's address but never confirmed it.
      const squatter = await signUp('Not Maya', 'maya@northstar.studio', { verified: false });

      const answer = await google(await googleToken({ email: 'maya@northstar.studio' })).expect(200);
      expect(answer.body.user.emailVerified).toBe(true);
      await squatter.get('/auth/me').expect(401);
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'maya@northstar.studio', password: 'northstar2026' })
        .expect(401);
    });

    it('refuses to link an unverified Google email to an existing account', async () => {
      await signUp('Maya Okafor', 'maya@northstar.studio');
      const refused = await google(
        await googleToken({ email: 'maya@northstar.studio', verified: false }),
      ).expect(409);
      expect(refused.body.message).toMatch(/Sign in with your password/);
      expect(await prisma.authIdentity.count()).toBe(0);
    });

    it('creates an unverified account for an unverified Google email and emails a link', async () => {
      const answer = await google(
        await googleToken({ email: 'tom@northstar.studio', verified: false }),
      ).expect(200);
      expect(answer.body.user.emailVerified).toBe(false);
      expect(sent.map((mail) => mail.to)).toEqual(['tom@northstar.studio']);
    });

    it('lets a Google sign-up accept an invitation to its address', async () => {
      const maya = await signUp('Maya Okafor', 'maya@northstar.studio');
      await maya.post('/workspaces').send({ name: 'Northstar Studio' }).expect(201);
      const invitation = await maya
        .post('/workspaces/northstar-studio/invitations')
        .send({ email: 'tom@northstar.studio', role: 'EDITOR' })
        .expect(201);
      const token = (invitation.body.acceptUrl as string).split('/invite/')[1];

      const tom = request.agent(app.getHttpServer());
      await google(await googleToken({ email: 'tom@northstar.studio', name: 'Tom' }), tom).expect(
        200,
      );
      const accepted = await tom.post(`/invitations/${token}/accept`).expect(200);
      expect(accepted.body).toMatchObject({ slug: 'northstar-studio', role: 'EDITOR' });
    });

    it('rejects forged, expired and foreign tokens', async () => {
      const account = { email: 'maya@northstar.studio' };
      const forged = await googleToken(account, { secret: 'not-the-project-secret-0123456789' });
      const expired = await googleToken(account, { expiresIn: '-1m' });
      const otherProject = await googleToken(account, {
        issuer: 'https://someone-else.supabase.co/auth/v1',
      });
      const wrongAudience = await googleToken(account, { audience: 'anon' });
      for (const token of [forged, expired, otherProject, wrongAudience, 'not-a-jwt']) {
        await google(token).expect(401);
      }
      expect(await prisma.user.count()).toBe(0);
    });

    it('rejects a valid token that Supabase no longer accepts or that is not from Google', async () => {
      const revoked = await googleToken({ email: 'maya@northstar.studio' });
      supabaseUsers.clear();
      await google(revoked).expect(401);

      const passwordOnly = await googleToken({ email: 'tom@northstar.studio' });
      supabaseUsers.set('sb-tom@northstar.studio', {
        id: 'sb-tom@northstar.studio',
        email: 'tom@northstar.studio',
        identities: [{ provider: 'email', identity_data: { email: 'tom@northstar.studio' } }],
      });
      await google(passwordOnly).expect(401);
      expect(await prisma.user.count()).toBe(0);
    });
  });
});
