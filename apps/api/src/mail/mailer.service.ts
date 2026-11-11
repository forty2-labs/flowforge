import { Injectable, Logger } from '@nestjs/common';
import { env } from '../env.js';

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

export type MailResult = 'sent' | 'logged' | 'failed';

const RESEND_URL = 'https://api.resend.com/emails';
const SEND_TIMEOUT_MS = 10_000;

// Sends through Resend when RESEND_API_KEY is set. Without it, messages are
// written to the log so links can be copied during development.
// Never throws: callers decide what a failed delivery means for them.
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    if (env.isProduction && !env.mail.resendApiKey) {
      this.logger.warn('RESEND_API_KEY is not set: emails are logged, not sent.');
    }
  }

  async send(mail: Mail): Promise<MailResult> {
    const { resendApiKey, from } = env.mail;
    if (!resendApiKey) {
      this.logger.log(`To ${mail.to} · ${mail.subject}\n${mail.text}`);
      return 'logged';
    }

    try {
      const response = await fetch(RESEND_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, text: mail.text }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        this.logger.error(`Resend answered ${response.status} for "${mail.subject}": ${detail}`);
        return 'failed';
      }
      return 'sent';
    } catch (error) {
      this.logger.error(`Sending "${mail.subject}" failed: ${String(error)}`);
      return 'failed';
    }
  }
}
