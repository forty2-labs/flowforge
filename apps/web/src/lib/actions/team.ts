"use server";

import type { InvitationDto, WorkspaceDto } from "@flowforge/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, messageFrom } from "../api";
import type { FormState } from "../form-state";

export interface InviteState extends FormState {
  acceptUrl?: string;
  email?: string;
}

type Issued = InvitationDto & { acceptUrl: string };

export async function inviteMember(
  slug: string,
  _previous: InviteState,
  formData: FormData,
): Promise<InviteState> {
  try {
    const invitation = await api<Issued>(`/workspaces/${slug}/invitations`, {
      method: "POST",
      body: {
        email: String(formData.get("email") ?? ""),
        role: String(formData.get("role") ?? ""),
      },
    });
    revalidatePath(`/w/${slug}/team`);
    return { acceptUrl: invitation.acceptUrl, email: invitation.email };
  } catch (error) {
    return { error: messageFrom(error) };
  }
}

export async function resendInvitation(
  slug: string,
  invitationId: string,
): Promise<InviteState> {
  try {
    const invitation = await api<Issued>(
      `/workspaces/${slug}/invitations/${invitationId}/resend`,
      { method: "POST" },
    );
    revalidatePath(`/w/${slug}/team`);
    return { acceptUrl: invitation.acceptUrl, email: invitation.email };
  } catch (error) {
    return { error: messageFrom(error) };
  }
}

export async function revokeInvitation(
  slug: string,
  invitationId: string,
): Promise<FormState> {
  try {
    await api(`/workspaces/${slug}/invitations/${invitationId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  revalidatePath(`/w/${slug}/team`);
  return {};
}

export async function changeMemberRole(
  slug: string,
  userId: string,
  role: string,
): Promise<FormState> {
  try {
    await api(`/workspaces/${slug}/members/${userId}`, {
      method: "PATCH",
      body: { role },
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  revalidatePath(`/w/${slug}/team`);
  return {};
}

export async function removeMember(
  slug: string,
  userId: string,
  isSelf: boolean,
): Promise<FormState> {
  try {
    await api(`/workspaces/${slug}/members/${userId}`, { method: "DELETE" });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  if (isSelf) redirect("/");
  revalidatePath(`/w/${slug}/team`);
  return {};
}

export async function acceptInvitation(token: string): Promise<FormState> {
  let workspace: WorkspaceDto;
  try {
    workspace = await api<WorkspaceDto>(`/invitations/${token}/accept`, {
      method: "POST",
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  redirect(`/w/${workspace.slug}`);
}
