"use server";

import type { InvitationDto, Role, WorkspaceDto } from "@flowforge/types";
import { actionResult, api } from "../api";
import type { ActionResult } from "../form-state";

// Each action is called from a TanStack Query mutation, which invalidates
// `membersQuery` or `invitationsQuery` on success.

export interface InviteInput {
  email: string;
  role: string;
}

// The link to hand to the invitee. It is shown only once. `emailSent` says
// whether the API also emailed it.
export interface IssuedLink {
  email: string;
  acceptUrl: string;
  emailSent: boolean;
}

type Issued = InvitationDto & IssuedLink;

const issuedLink = ({ email, acceptUrl, emailSent }: Issued): IssuedLink => ({
  email,
  acceptUrl,
  emailSent,
});

export async function inviteMember(
  slug: string,
  input: InviteInput,
): Promise<ActionResult<IssuedLink>> {
  return actionResult(async () => {
    const invitation = await api<Issued>(`/workspaces/${slug}/invitations`, {
      method: "POST",
      body: { email: String(input.email ?? ""), role: String(input.role ?? "") },
    });
    return issuedLink(invitation);
  });
}

export async function resendInvitation(
  slug: string,
  invitationId: string,
): Promise<ActionResult<IssuedLink>> {
  return actionResult(async () => {
    const invitation = await api<Issued>(
      `/workspaces/${slug}/invitations/${invitationId}/resend`,
      { method: "POST" },
    );
    return issuedLink(invitation);
  });
}

export async function revokeInvitation(
  slug: string,
  invitationId: string,
): Promise<ActionResult<null>> {
  return actionResult(async () => {
    await api(`/workspaces/${slug}/invitations/${invitationId}`, { method: "DELETE" });
    return null;
  });
}

export async function changeMemberRole(
  slug: string,
  userId: string,
  role: Role,
): Promise<ActionResult<null>> {
  return actionResult(async () => {
    await api(`/workspaces/${slug}/members/${userId}`, {
      method: "PATCH",
      body: { role: String(role ?? "") },
    });
    return null;
  });
}

// Removing yourself is leaving; the caller then navigates away.
export async function removeMember(
  slug: string,
  userId: string,
): Promise<ActionResult<null>> {
  return actionResult(async () => {
    await api(`/workspaces/${slug}/members/${userId}`, { method: "DELETE" });
    return null;
  });
}

// The workspace just joined, for the caller to navigate to.
export async function acceptInvitation(
  token: string,
): Promise<ActionResult<WorkspaceDto>> {
  return actionResult(() =>
    api<WorkspaceDto>(`/invitations/${encodeURIComponent(token)}/accept`, {
      method: "POST",
    }),
  );
}
