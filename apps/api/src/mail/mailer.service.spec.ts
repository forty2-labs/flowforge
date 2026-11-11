import { afterEach, describe, expect, it, vi } from 'vitest';
import { env } from '../env.js';
import { MailerService } from './mailer.service.js';

const mail = { to: 'tom@northstar.studio', subject: 'Hello', text: 'Body' };

describe('MailerService', () => {
  const original = { ...env.mail };

  afterEach(() => {
    Object.assign(env.mail, original);
    vi.unstubAllGlobals();
  });

  it('logs instead of sending when no API key is set', async () => {
    env.mail.resendApiKey = undefined;
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    expect(await new MailerService().send(mail)).toBe('logged');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends through Resend with the configured sender', async () => {
    Object.assign(env.mail, { resendApiKey: 're_test', from: 'Flowforge <team@example.com>' });
    const fetch = vi.fn().mockResolvedValue(new Response('{"id":"1"}', { status: 200 }));
    vi.stubGlobal('fetch', fetch);

    expect(await new MailerService().send(mail)).toBe('sent');
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer re_test' });
    expect(JSON.parse(init.body as string)).toEqual({
      from: 'Flowforge <team@example.com>',
      to: ['tom@northstar.studio'],
      subject: 'Hello',
      text: 'Body',
    });
  });

  it('reports a rejected request as failed instead of throwing', async () => {
    env.mail.resendApiKey = 're_test';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('bad', { status: 422 })));

    expect(await new MailerService().send(mail)).toBe('failed');
  });

  it('reports a network error as failed instead of throwing', async () => {
    env.mail.resendApiKey = 're_test';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    expect(await new MailerService().send(mail)).toBe('failed');
  });
});
