import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { env, type SupabaseConfig } from '../env.js';

// What Google told Supabase about the person.
export interface GoogleProfile {
  // Google's own id for the account (`sub`). Stable for the life of the account.
  subject: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

// The parts of Supabase's GET /auth/v1/user answer that are used here.
export interface SupabaseUser {
  id: string;
  email?: string;
  identities?: {
    provider: string;
    identity_data?: Record<string, unknown>;
  }[];
}

const INVALID = 'Google sign-in failed. Try again.';
const FETCH_TIMEOUT_MS = 5000;

// Asks Supabase who an access token belongs to. A separate class so tests can
// replace the network call while still checking real signed tokens.
@Injectable()
export class SupabaseUserClient {
  async get(config: SupabaseConfig, accessToken: string): Promise<SupabaseUser | null> {
    const response = await fetch(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.anonKey, authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) throw new Error(`Supabase answered ${response.status}`);
    return (await response.json()) as SupabaseUser;
  }
}

// Supabase Auth runs the Google sign-in. This turns the access token it hands
// the browser into a Google profile, and is the only place that trusts Supabase.
@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);
  private jwks?: JWTVerifyGetKey;

  constructor(private readonly users: SupabaseUserClient) {}

  async googleProfile(accessToken: string): Promise<GoogleProfile> {
    const config = env.supabase;
    if (!config) {
      throw new ServiceUnavailableException('Google sign-in is not set up.');
    }
    await this.verify(config, accessToken);

    // The token's own user_metadata can be edited by its holder, so whether
    // Google verified the email comes from the identity record instead, which
    // only Supabase writes.
    let user: SupabaseUser | null;
    try {
      user = await this.users.get(config, accessToken);
    } catch (error) {
      this.logger.warn(`Supabase user lookup failed: ${String(error)}`);
      throw new ServiceUnavailableException('Couldn’t reach Google sign-in. Try again.');
    }
    if (!user) throw new UnauthorizedException(INVALID);

    const data = user.identities?.find((identity) => identity.provider === 'google')
      ?.identity_data;
    const subject = text(data?.sub) ?? text(data?.provider_id);
    const email = (text(data?.email) ?? text(user.email))?.toLowerCase();
    if (!data || !subject || !email) throw new UnauthorizedException(INVALID);

    return {
      subject,
      email,
      emailVerified: data.email_verified === true,
      name: (text(data.full_name) ?? text(data.name) ?? email.split('@')[0]).slice(0, 80),
    };
  }

  // Rejects forged and expired tokens, and tokens from another Supabase project.
  // Projects on signing keys sign with ES256 or RS256, checked against the keys
  // they publish. Legacy projects sign with HS256 and the shared secret, which
  // is accepted only when SUPABASE_JWT_SECRET is set.
  private async verify(config: SupabaseConfig, accessToken: string): Promise<void> {
    this.jwks ??= createRemoteJWKSet(new URL(`${config.url}/auth/v1/.well-known/jwks.json`));
    const jwks = this.jwks;
    const secret = config.jwtSecret ? new TextEncoder().encode(config.jwtSecret) : undefined;
    try {
      await jwtVerify(
        accessToken,
        (header, token) => (header.alg === 'HS256' && secret ? secret : jwks(header, token)),
        {
          issuer: `${config.url}/auth/v1`,
          audience: 'authenticated',
          algorithms: secret ? ['ES256', 'RS256', 'HS256'] : ['ES256', 'RS256'],
        },
      );
    } catch {
      throw new UnauthorizedException(INVALID);
    }
  }
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
