import { exportJWK, generateKeyPair, SignJWT, type CryptoKey } from 'jose';
import { env } from '../env.js';
import { SupabaseAuthService, type SupabaseUser } from './supabase-auth.service.js';

// Projects on Supabase's asymmetric signing keys have no shared secret: the
// token is checked against the keys the project publishes. The e2e tests
// cover the shared-secret path.
describe('SupabaseAuthService with published signing keys', () => {
  const url = 'https://flowforge-unit.supabase.co';
  let privateKey: CryptoKey;
  let jwks: { keys: object[] };
  const user: SupabaseUser = {
    id: 'sb-1',
    email: 'maya@northstar.studio',
    identities: [
      {
        provider: 'google',
        identity_data: {
          sub: 'google-1',
          email: 'Maya@Northstar.studio',
          email_verified: true,
          full_name: 'Maya Okafor',
        },
      },
    ],
  };
  const service = () => new SupabaseAuthService({ get: async () => user });

  const sign = (key: CryptoKey, kid = 'key-1') =>
    new SignJWT({ role: 'authenticated' })
      .setProtectedHeader({ alg: 'ES256', kid })
      .setSubject('sb-1')
      .setIssuer(`${url}/auth/v1`)
      .setAudience('authenticated')
      .setExpirationTime('1h')
      .sign(key);

  beforeAll(async () => {
    const pair = await generateKeyPair('ES256');
    privateKey = pair.privateKey;
    jwks = { keys: [{ ...(await exportJWK(pair.publicKey)), kid: 'key-1', alg: 'ES256' }] };
  });

  beforeEach(() => {
    env.supabase = { url, anonKey: 'anon' };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) => {
        expect(String(input)).toBe(`${url}/auth/v1/.well-known/jwks.json`);
        return Response.json(jwks);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    env.supabase = undefined;
  });

  it('accepts a token signed with a published key and reads the Google identity', async () => {
    await expect(service().googleProfile(await sign(privateKey))).resolves.toEqual({
      subject: 'google-1',
      email: 'maya@northstar.studio',
      emailVerified: true,
      name: 'Maya Okafor',
    });
  });

  it('rejects a token signed with any other key', async () => {
    const stranger = await generateKeyPair('ES256');
    await expect(service().googleProfile(await sign(stranger.privateKey))).rejects.toMatchObject({
      status: 401,
    });
  });

  it('still checks signing-key tokens against the published keys when a secret is set', async () => {
    env.supabase = { url, anonKey: 'anon', jwtSecret: 'legacy-shared-secret-0123456789abcdef' };
    await expect(service().googleProfile(await sign(privateKey))).resolves.toMatchObject({
      subject: 'google-1',
    });
  });

  it('rejects an HS256 token when no secret is set', async () => {
    const hs256 = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(`${url}/auth/v1`)
      .setAudience('authenticated')
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode('guessed-secret-0123456789abcdef0123'));
    await expect(service().googleProfile(hs256)).rejects.toMatchObject({ status: 401 });
  });

  it('answers 503 when Google sign-in is not set up', async () => {
    env.supabase = undefined;
    await expect(service().googleProfile(await sign(privateKey))).rejects.toMatchObject({
      status: 503,
    });
  });
});
