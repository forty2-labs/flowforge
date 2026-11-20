import path from 'node:path';
import { config } from 'dotenv';

const LOCAL_DB = `postgresql://flowforge:flowforge@localhost:5432/flowforge`;
const LOCALHOST = 'http://localhost:3000';
const DEFAULT_PORT = 4000;

// One .env at the repo root serves every app.
config({
  path: path.resolve(import.meta.dirname, '../../../.env'),
  quiet: true,
});

const isProduction = process.env.NODE_ENV === 'production';

// Takes the first name that is set, so a provider's own variable can stand in.
function required(names: string | string[], devDefault: string): string {
  const list = Array.isArray(names) ? names : [names];
  for (const name of list) {
    const value = process.env[name];
    if (value) return value;
  }
  if (isProduction)
    throw new Error(`Missing environment variable ${list.join(' or ')}`);
  return devDefault;
}

export const env = {
  isProduction,
  port: Number(process.env.API_PORT ?? DEFAULT_PORT),
  // POSTGRES_URL is the pooled URL the Supabase Vercel integration injects.
  databaseUrl: required(['DATABASE_URL', 'POSTGRES_URL'], LOCAL_DB),
  webOrigin: required('WEB_ORIGIN', LOCALHOST),
  mail: {
    // Optional: without a key, emails are written to the log instead.
    resendApiKey: process.env.RESEND_API_KEY || undefined,
    // Resend's shared sender only delivers to the Resend account's own address.
    from: process.env.MAIL_FROM || 'Flowforge <onboarding@resend.dev>',
  },
  supabase: supabaseConfig(),
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  // The legacy shared secret. When set, HS256 tokens are accepted too; tokens
  // signed with the project's signing keys are always checked against the
  // keys it publishes.
  jwtSecret?: string;
}

// Optional: without a URL and anon key, Google sign-in answers 503 and
// password sign-in works as before.
function supabaseConfig(): SupabaseConfig | undefined {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return undefined;
  return { url, anonKey, jwtSecret: process.env.SUPABASE_JWT_SECRET || undefined };
}
