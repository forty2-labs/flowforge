import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';
import { InvitationsController, WorkspaceInvitationsController } from './invitations.controller.js';
import { InvitationsService } from './invitations.service.js';
import { MembersController } from './members.controller.js';
import { MembersService } from './members.service.js';

@Module({
  imports: [WorkspacesModule, MailModule],
  controllers: [MembersController, WorkspaceInvitationsController, InvitationsController],
  providers: [MembersService, InvitationsService],
})
export class TeamModule {}
