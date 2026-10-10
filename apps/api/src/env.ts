import path from 'node:path';
import { config } from 'dotenv';

// One .env at the repo root serves every app.
config({ path: path.resolve(import.meta.dirname, '../../../.env'), quiet: true });

const isProduction = process.env.NODE_ENV === 'production';

function required(name: string, devDefault: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) throw new Error(`Missing environment variable ${name}`);
  return devDefault;
}

export const env = {
  isProduction,
  port: Number(process.env.API_PORT ?? 4000),
  databaseUrl: required(
    'DATABASE_URL',
    'postgresql://flowforge:flowforge@localhost:5432/flowforge',
  ),
  webOrigin: required('WEB_ORIGIN', 'http://localhost:3000'),
};
