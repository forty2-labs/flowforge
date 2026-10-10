import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import type { InvitationDto, InvitationPreviewDto, WorkspaceDto } from '@flowforge/types';
import { CurrentUser, Public, type AuthUser } from '../auth/auth.decorators.js';
import {
  CurrentWorkspace,
  RequireCapability,
  WorkspaceGuard,
  type WorkspaceContext,
} from '../workspaces/workspace.guard.js';
import { InvitationsService, type IssuedInvitation } from './invitations.service.js';
import { InviteDto } from './team.dto.js';

@Controller('workspaces/:workspaceSlug/invitations')
@UseGuards(WorkspaceGuard)
@RequireCapability('team.manage')
export class WorkspaceInvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get()
  list(@CurrentWorkspace() workspace: WorkspaceContext): Promise<InvitationDto[]> {
    return this.invitations.listPending(workspace.id);
  }

  @Post()
  invite(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @CurrentUser() user: AuthUser,
    @Body() dto: InviteDto,
  ): Promise<IssuedInvitation> {
    return this.invitations.invite(workspace, user, dto.email, dto.role);
  }

  @Post(':invitationId/resend')
  @HttpCode(200)
  resend(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @CurrentUser() user: AuthUser,
    @Param('invitationId') invitationId: string,
  ): Promise<IssuedInvitation> {
    return this.invitations.resend(workspace, user, invitationId);
  }

  @Delete(':invitationId')
  @HttpCode(204)
  revoke(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param('invitationId') invitationId: string,
  ): Promise<void> {
    return this.invitations.revoke(workspace.id, invitationId);
  }
}

// The invited person's side: they hold a token, not a membership.
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Public()
  @Get(':token')
  preview(@Param('token') token: string): Promise<InvitationPreviewDto> {
    return this.invitations.preview(token);
  }

  @Post(':token/accept')
  @HttpCode(200)
  accept(@Param('token') token: string, @CurrentUser() user: AuthUser): Promise<WorkspaceDto> {
    return this.invitations.accept(token, user);
  }
}
