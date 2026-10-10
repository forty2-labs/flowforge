import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { can, type MemberDto } from '@flowforge/types';
import { CurrentUser, type AuthUser } from '../auth/auth.decorators.js';
import {
  CurrentWorkspace,
  RequireCapability,
  WorkspaceGuard,
  type WorkspaceContext,
} from '../workspaces/workspace.guard.js';
import { MembersService } from './members.service.js';
import { ChangeRoleDto } from './team.dto.js';

@Controller('workspaces/:workspaceSlug/members')
@UseGuards(WorkspaceGuard)
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  list(@CurrentWorkspace() workspace: WorkspaceContext): Promise<MemberDto[]> {
    return this.members.list(workspace.id);
  }

  @Patch(':userId')
  @HttpCode(204)
  @RequireCapability('team.manage')
  changeRole(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param('userId') userId: string,
    @Body() dto: ChangeRoleDto,
  ): Promise<void> {
    return this.members.changeRole(workspace, userId, dto.role);
  }

  // Anyone may remove themselves (leave); removing others needs team.manage.
  @Delete(':userId')
  @HttpCode(204)
  remove(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @CurrentUser() user: AuthUser,
    @Param('userId') userId: string,
  ): Promise<void> {
    if (userId !== user.id && !can(workspace.role, 'team.manage')) {
      throw new ForbiddenException('Your role in this workspace does not allow this.');
    }
    return this.members.remove(workspace, userId);
  }
}
