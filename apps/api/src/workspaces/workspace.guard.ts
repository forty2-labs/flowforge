import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { can, type Capability, type Role } from '@flowforge/types';
import type { AuthedRequest } from '../auth/auth.decorators.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface WorkspaceContext {
  id: string;
  name: string;
  slug: string;
  role: Role;
}

interface WorkspaceRequest extends AuthedRequest {
  workspace?: WorkspaceContext;
}

const CAPABILITY = 'requiredCapability';
export const RequireCapability = (capability: Capability) => SetMetadata(CAPABILITY, capability);

export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, context: ExecutionContext): WorkspaceContext => {
    return context.switchToHttp().getRequest<WorkspaceRequest>().workspace!;
  },
);

// Scopes a request to the workspace named by the :workspaceSlug route param and
// enforces the caller's role there. Runs after the global AuthGuard.
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<WorkspaceRequest>();
    const slug = request.params.workspaceSlug;
    const user = request.user;
    if (typeof slug !== 'string' || !user) throw new NotFoundException('Workspace not found.');

    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id, workspace: { slug } },
      include: { workspace: true },
    });
    // Non-members get the same answer as a missing workspace.
    if (!membership) throw new NotFoundException('Workspace not found.');

    request.workspace = {
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      role: membership.role,
    };

    const capability = this.reflector.getAllAndOverride<Capability | undefined>(CAPABILITY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (capability && !can(membership.role, capability)) {
      throw new ForbiddenException('Your role in this workspace does not allow this.');
    }
    return true;
  }
}
