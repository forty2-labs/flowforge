import type { PoolConfig } from 'pg';
import { SUPABASE_ROOT_CA } from './supabase-ca.js';

// pg lets SSL settings parsed from the URL override the `ssl` option, so they
// are removed before Supabase's CA is supplied in their place.
const URL_SSL_PARAMS = ['sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'uselibpqcompat'];

function isSupabaseHost(hostname: string): boolean {
  return /(^|\.)supabase\.(com|co)$/.test(hostname);
}

// Supabase connections verify the full chain (hostname included) against
// Supabase's root CA. Any other database is connected to exactly as its URL says.
export function connectionConfig(databaseUrl: string): PoolConfig {
  const url = new URL(databaseUrl);
  if (!isSupabaseHost(url.hostname)) return { connectionString: databaseUrl };

  for (const param of URL_SSL_PARAMS) url.searchParams.delete(param);
  return {
    connectionString: url.toString(),
    ssl: { ca: SUPABASE_ROOT_CA, rejectUnauthorized: true },
  };
}
