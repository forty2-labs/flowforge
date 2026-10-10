import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { InvitationDto, InvitationPreviewDto, Role, WorkspaceDto } from '@flowforge/types';
import type { AuthUser } from '../auth/auth.decorators.js';
import { hashToken, newToken } from '../common/tokens.js';
import { env } from '../env.js';
import { MailerService } from '../mail/mailer.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { WorkspaceContext } from '../workspaces/workspace.guard.js';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// The raw token only exists in the link, so the link is returned once, when
// the invitation is created or resent.
export type IssuedInvitation = InvitationDto & { acceptUrl: string };

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async listPending(workspaceId: string): Promise<InvitationDto[]> {
    const invitations = await this.prisma.invitation.findMany({
      where: { workspaceId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    return invitations.map(toDto);
  }

  async invite(
    workspace: WorkspaceContext,
    inviter: AuthUser,
    email: string,
    role: Role,
  ): Promise<IssuedInvitation> {
    const member = await this.prisma.membership.findFirst({
      where: { workspaceId: workspace.id, user: { email } },
    });
    if (member) throw new ConflictException(`${email} is already in this workspace.`);

    const { token, tokenHash } = newToken();
    const [, invitation] = await this.prisma.$transaction([
      // A new invitation replaces any earlier one to the same address.
      this.prisma.invitation.updateMany({
        where: { workspaceId: workspace.id, email, status: 'PENDING' },
        data: { status: 'REVOKED' },
      }),
      this.prisma.invitation.create({
        data: {
          workspaceId: workspace.id,
          email,
          role,
          tokenHash,
          invitedById: inviter.id,
          expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
        },
      }),
    ]);
    return this.issue(invitation, token, workspace.name, inviter.name);
  }

  async resend(
    workspace: WorkspaceContext,
    inviter: AuthUser,
    invitationId: string,
  ): Promise<IssuedInvitation> {
    await this.findPending(workspace.id, invitationId);
    const { token, tokenHash } = newToken();
    const invitation = await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { tokenHash, expiresAt: new Date(Date.now() + INVITATION_TTL_MS) },
    });
    return this.issue(invitation, token, workspace.name, inviter.name);
  }

  async revoke(workspaceId: string, invitationId: string): Promise<void> {
    await this.findPending(workspaceId, invitationId);
    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'REVOKED' },
    });
  }

  async preview(token: string): Promise<InvitationPreviewDto> {
    const invitation = await this.findByToken(token);
    return {
      email: invitation.email,
      role: invitation.role,
      workspaceName: invitation.workspace.name,
      expired: invitation.expiresAt.getTime() <= Date.now(),
    };
  }

  async accept(token: string, user: AuthUser): Promise<WorkspaceDto> {
    const invitation = await this.findByToken(token);
    if (invitation.expiresAt.getTime() <= Date.now()) {
      throw new GoneException('This invitation has expired. Ask for a new one.');
    }
    if (invitation.email !== user.email.toLowerCase()) {
      throw new ForbiddenException(
        `This invitation was sent to ${invitation.email}. Sign in with that email to accept it.`,
      );
    }
    await this.prisma.$transaction([
      this.prisma.membership.upsert({
        where: { workspaceId_userId: { workspaceId: invitation.workspaceId, userId: user.id } },
        // Accepting never changes the role of someone who is already a member.
        update: {},
        create: { workspaceId: invitation.workspaceId, userId: user.id, role: invitation.role },
      }),
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      }),
    ]);
    const membership = await this.prisma.membership.findUniqueOrThrow({
      where: { workspaceId_userId: { workspaceId: invitation.workspaceId, userId: user.id } },
    });
    return {
      id: invitation.workspace.id,
      name: invitation.workspace.name,
      slug: invitation.workspace.slug,
      role: membership.role,
    };
  }

  private async findPending(workspaceId: string, invitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, workspaceId, status: 'PENDING' },
    });
    if (!invitation) throw new NotFoundException('Invitation not found.');
    return invitation;
  }

  private async findByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { workspace: true },
    });
    if (!invitation || invitation.status !== 'PENDING') {
      throw new NotFoundException('This invitation is no longer valid.');
    }
    return invitation;
  }

  private async issue(
    invitation: Parameters<typeof toDto>[0],
    token: string,
    workspaceName: string,
    inviterName: string,
  ): Promise<IssuedInvitation> {
    const acceptUrl = `${env.webOrigin}/invite/${token}`;
    await this.mailer.send({
      to: invitation.email,
      subject: `${inviterName} invited you to ${workspaceName} on Flowforge`,
      text: `Accept the invitation: ${acceptUrl}\nThe link works for 7 days.`,
    });
    return { ...toDto(invitation), acceptUrl };
  }
}

function toDto(invitation: {
  id: string;
  email: string;
  role: Role;
  expiresAt: Date;
  status: InvitationDto['status'];
}): InvitationDto {
  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expiresAt.toISOString(),
    status: invitation.status,
  };
}
