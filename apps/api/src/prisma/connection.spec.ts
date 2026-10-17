import { connectionConfig } from './connection.js';
import { SUPABASE_ROOT_CA } from './supabase-ca.js';

describe('connectionConfig', () => {
  it('leaves non-Supabase URLs untouched', () => {
    const url = 'postgresql://flowforge:flowforge@localhost:5432/flowforge';
    expect(connectionConfig(url)).toEqual({ connectionString: url });
  });

  it('verifies Supabase connections against the Supabase root CA', () => {
    const config = connectionConfig(
      'postgres://postgres.ref:pw@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x',
    );
    expect(config.ssl).toEqual({ ca: SUPABASE_ROOT_CA, rejectUnauthorized: true });
  });

  it('drops SSL params from the URL so they cannot override the CA', () => {
    const { connectionString } = connectionConfig(
      'postgres://u:p@db.ref.supabase.co:5432/postgres?sslmode=require&uselibpqcompat=true&sslrootcert=/x&supa=base-pooler.x',
    );
    const params = new URL(connectionString!).searchParams;
    expect(params.has('sslmode')).toBe(false);
    expect(params.has('uselibpqcompat')).toBe(false);
    expect(params.has('sslrootcert')).toBe(false);
    expect(params.get('supa')).toBe('base-pooler.x');
  });

  it('does not treat look-alike hosts as Supabase', () => {
    const url = 'postgres://u:p@supabase.com.evil.example:5432/db?sslmode=require';
    expect(connectionConfig(url)).toEqual({ connectionString: url });
  });

  it('embeds a single PEM certificate', () => {
    expect(SUPABASE_ROOT_CA.match(/BEGIN CERTIFICATE/g)).toHaveLength(1);
  });
});
