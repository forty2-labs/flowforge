"use server";

import type { WorkspaceDto } from "@flowforge/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, messageFrom } from "../api";
import type { FormState } from "../form-state";

export async function createWorkspace(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  let workspace: WorkspaceDto;
  try {
    workspace = await api<WorkspaceDto>("/workspaces", {
      method: "POST",
      body: { name: String(formData.get("name") ?? "") },
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  redirect(`/w/${workspace.slug}`);
}

export async function renameWorkspace(
  slug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await api(`/workspaces/${slug}`, {
      method: "PATCH",
      body: { name: String(formData.get("name") ?? "") },
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  revalidatePath(`/w/${slug}`, "layout");
  return { notice: "Workspace name saved." };
}
