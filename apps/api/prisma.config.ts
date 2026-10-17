import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// One .env at the repo root serves every app.
config({ path: path.resolve(import.meta.dirname, '../../.env'), quiet: true });

const isProduction =
  process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

// Migrations can't run through Supabase's transaction pooler, so fall back
// to the integration's non-pooling URL rather than POSTGRES_URL.
function databaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (url) return url;
  // Without this, a missing variable shows up as a failed connection to localhost.
  if (isProduction) {
    throw new Error('Missing environment variable DATABASE_URL or POSTGRES_URL_NON_POOLING');
  }
  return 'postgresql://flowforge:flowforge@localhost:5432/flowforge';
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: databaseUrl() },
});
