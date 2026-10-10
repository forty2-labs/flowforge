import { Module } from '@nestjs/common';
import { MailerService } from '../mail/mailer.service.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';
import { InvitationsController, WorkspaceInvitationsController } from './invitations.controller.js';
import { InvitationsService } from './invitations.service.js';
import { MembersController } from './members.controller.js';
import { MembersService } from './members.service.js';

@Module({
  imports: [WorkspacesModule],
  controllers: [MembersController, WorkspaceInvitationsController, InvitationsController],
  providers: [MembersService, InvitationsService, MailerService],
})
export class TeamModule {}
