import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import type { WorkspaceDto } from '@flowforge/types';
import { CurrentUser, type AuthUser } from '../auth/auth.decorators.js';
import {
  CurrentWorkspace,
  RequireCapability,
  WorkspaceGuard,
  type WorkspaceContext,
} from './workspace.guard.js';
import { WorkspaceNameDto } from './workspaces.dto.js';
import { WorkspacesService } from './workspaces.service.js';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: WorkspaceNameDto): Promise<WorkspaceDto> {
    return this.workspaces.create(user.id, dto.name);
  }

  @Get(':workspaceSlug')
  @UseGuards(WorkspaceGuard)
  get(@CurrentWorkspace() workspace: WorkspaceContext): WorkspaceDto {
    return workspace;
  }

  @Patch(':workspaceSlug')
  @UseGuards(WorkspaceGuard)
  @RequireCapability('workspace.manage')
  async rename(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Body() dto: WorkspaceNameDto,
  ): Promise<WorkspaceDto> {
    const { name } = await this.workspaces.rename(workspace.id, dto.name);
    return { ...workspace, name };
  }
}
