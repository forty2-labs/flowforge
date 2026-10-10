import { Module } from '@nestjs/common';
import { WorkspaceGuard } from './workspace.guard.js';
import { WorkspacesController } from './workspaces.controller.js';
import { WorkspacesService } from './workspaces.service.js';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceGuard],
  exports: [WorkspaceGuard],
})
export class WorkspacesModule {}
