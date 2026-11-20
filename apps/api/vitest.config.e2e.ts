import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // e2e tests truncate tables, so they get their own database.
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgresql://flowforge:flowforge@localhost:5432/flowforge_test',
      // Never send real email from tests, even if the root .env has a key.
      RESEND_API_KEY: '',
      // Google sign-in checks tokens the tests sign with this secret. The
      // Supabase user lookup is replaced in the test module, so nothing is
      // sent to this URL.
      SUPABASE_URL: 'https://flowforge-test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_JWT_SECRET: 'test-only-supabase-jwt-secret-0123456789',
    },
    fileParallelism: false,
  },
});
