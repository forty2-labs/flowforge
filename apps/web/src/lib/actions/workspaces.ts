"use server";

import type { WorkspaceDto } from "@flowforge/types";
import { revalidatePath } from "next/cache";
import { actionResult, api } from "../api";
import type { ActionResult } from "../form-state";

// The new workspace, for the caller to navigate to.
export async function createWorkspace(input: {
  name: string;
}): Promise<ActionResult<WorkspaceDto>> {
  return actionResult(() =>
    api<WorkspaceDto>("/workspaces", {
      method: "POST",
      body: { name: String(input.name ?? "") },
    }),
  );
}

export async function renameWorkspace(
  slug: string,
  input: { name: string },
): Promise<ActionResult<null>> {
  const result = await actionResult(async () => {
    await api(`/workspaces/${slug}`, {
      method: "PATCH",
      body: { name: String(input.name ?? "") },
    });
    return null;
  });
  // The name is rendered by server components in the sidebar and page titles.
  if (!result.error) revalidatePath(`/w/${slug}`, "layout");
  return result;
}
