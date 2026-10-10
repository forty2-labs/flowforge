import { Injectable, Logger } from '@nestjs/common';

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

// No mail provider is wired up yet: messages are written to the log so links
// can be copied during development.
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  async send(mail: Mail): Promise<void> {
    this.logger.log(`To ${mail.to} · ${mail.subject}\n${mail.text}`);
  }
}
