import { Injectable } from '@nestjs/common';
import type { WorkspaceDto } from '@flowforge/types';
import { PrismaService } from '../prisma/prisma.service.js';
import { slugify } from './slug.js';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, name: string): Promise<WorkspaceDto> {
    const trimmed = name.trim();
    const slug = await this.availableSlug(slugify(trimmed));
    const workspace = await this.prisma.workspace.create({
      data: {
        name: trimmed,
        slug,
        memberships: { create: { userId, role: 'OWNER' } },
      },
    });
    return { id: workspace.id, name: workspace.name, slug: workspace.slug, role: 'OWNER' };
  }

  async rename(workspaceId: string, name: string): Promise<{ name: string }> {
    const workspace = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: name.trim() },
    });
    return { name: workspace.name };
  }

  private async availableSlug(base: string): Promise<string> {
    const taken = await this.prisma.workspace.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    const used = new Set(taken.map((workspace) => workspace.slug));
    if (!used.has(base)) return base;
    for (let suffix = 2; ; suffix += 1) {
      const candidate = `${base}-${suffix}`;
      if (!used.has(candidate)) return candidate;
    }
  }
}
