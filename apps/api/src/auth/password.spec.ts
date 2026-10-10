import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('verifies the password it hashed', async () => {
    const stored = await hashPassword('northstar2026');
    expect(await verifyPassword('northstar2026', stored)).toBe(true);
  });

  it('rejects a different password', async () => {
    const stored = await hashPassword('northstar2026');
    expect(await verifyPassword('northstar2027', stored)).toBe(false);
  });

  it('salts each hash', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });

  it('rejects a malformed stored value', async () => {
    expect(await verifyPassword('anything', 'not-a-hash')).toBe(false);
  });
});
