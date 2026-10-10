import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
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
      'TRUNCATE "Invitation", "Membership", "Session", "Workspace", "User" CASCADE',
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
});
