import { createHash, randomBytes } from 'node:crypto';

// Session and invitation tokens are stored hashed, so a database leak does not
// hand out working credentials.
export function newToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
