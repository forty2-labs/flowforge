import path from 'node:path';
import { config } from 'dotenv';

// One .env at the repo root serves every app.
config({ path: path.resolve(import.meta.dirname, '../../../.env'), quiet: true });

const isProduction = process.env.NODE_ENV === 'production';

// Takes the first name that is set, so a provider's own variable can stand in.
function required(names: string | string[], devDefault: string): string {
  const list = Array.isArray(names) ? names : [names];
  for (const name of list) {
    const value = process.env[name];
    if (value) return value;
  }
  if (isProduction) throw new Error(`Missing environment variable ${list.join(' or ')}`);
  return devDefault;
}

export const env = {
  isProduction,
  port: Number(process.env.API_PORT ?? 4000),
  // POSTGRES_URL is the pooled URL the Supabase Vercel integration injects.
  databaseUrl: required(
    ['DATABASE_URL', 'POSTGRES_URL'],
    'postgresql://flowforge:flowforge@localhost:5432/flowforge',
  ),
  webOrigin: required('WEB_ORIGIN', 'http://localhost:3000'),
};
