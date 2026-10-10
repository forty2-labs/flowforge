import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MemberDto, Role } from '@flowforge/types';
import { PrismaService } from '../prisma/prisma.service.js';
import type { WorkspaceContext } from '../workspaces/workspace.guard.js';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string): Promise<MemberDto[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    return memberships.map((membership) => ({
      userId: membership.userId,
      name: membership.user.name,
      email: membership.user.email,
      role: membership.role,
      joinedAt: membership.createdAt.toISOString(),
    }));
  }

  async changeRole(workspace: WorkspaceContext, userId: string, role: Role): Promise<void> {
    const target = await this.findMember(workspace.id, userId);
    if (target.role === role) return;
    // Only an Owner can create another Owner or change an existing one.
    if ((target.role === 'OWNER' || role === 'OWNER') && workspace.role !== 'OWNER') {
      throw new ForbiddenException('Only an Owner can change who owns the workspace.');
    }
    if (target.role === 'OWNER') await this.assertAnotherOwner(workspace.id);
    await this.prisma.membership.update({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
      data: { role },
    });
  }

  async remove(workspace: WorkspaceContext, userId: string): Promise<void> {
    const target = await this.findMember(workspace.id, userId);
    if (target.role === 'OWNER') {
      if (workspace.role !== 'OWNER') {
        throw new ForbiddenException('Only an Owner can remove an Owner.');
      }
      await this.assertAnotherOwner(workspace.id);
    }
    await this.prisma.membership.delete({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
    });
  }

  private async findMember(workspaceId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!membership) throw new NotFoundException('That person is not in this workspace.');
    return membership;
  }

  private async assertAnotherOwner(workspaceId: string): Promise<void> {
    const owners = await this.prisma.membership.count({ where: { workspaceId, role: 'OWNER' } });
    if (owners <= 1) {
      throw new ConflictException('A workspace needs at least one Owner. Make someone else an Owner first.');
    }
  }
}
