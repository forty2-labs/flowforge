import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// One .env at the repo root serves every app.
config({ path: path.resolve(import.meta.dirname, '../../.env'), quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // Migrations can't run through Supabase's transaction pooler, so fall back
    // to the integration's non-pooling URL rather than POSTGRES_URL.
    url:
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      'postgresql://flowforge:flowforge@localhost:5432/flowforge',
  },
});
