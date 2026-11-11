import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { MailerService, type Mail } from './../src/mail/mailer.service.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('Foundations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "PasswordReset", "Invitation", "Membership", "Session", "Workspace", "User" CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  const signUp = async (name: string, email: string) => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/auth/signup').send({ name, email, password: 'northstar2026' }).expect(201);
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
      vi.spyOn(app.get(MailerService), 'send').mockImplementation(async (mail) => {
        sent.push(mail);
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
});
