"use client";

import { Alert, Button, TextField } from "@flowforge/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { renameWorkspace } from "@/lib/actions/workspaces";
import { queryKeys } from "@/lib/query/keys";
import { requestErrorMessage, runAction } from "@/lib/query/request";

export function RenameWorkspaceForm({
  slug,
  name,
  canEdit,
}: {
  slug: string;
  name: string;
  canEdit: boolean;
}) {
  const queryClient = useQueryClient();
  const rename = useMutation({
    mutationFn: (input: { name: string }) => runAction(() => renameWorkspace(slug, input)),
    // The server components showing the name are refreshed by the action.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.session() }),
  });

  async function action(formData: FormData) {
    await rename
      .mutateAsync({ name: String(formData.get("name") ?? "") })
      .catch(() => {
        // Shown from rename.error below.
      });
  }

  return (
    <form action={action} className="flex max-w-[480px] flex-col gap-4">
      {rename.error && <Alert tone="error">{requestErrorMessage(rename.error)}</Alert>}
      {rename.isSuccess && <Alert tone="success">Workspace name saved.</Alert>}
      <TextField
        label="Workspace name"
        name="name"
        defaultValue={rename.variables?.name ?? name}
        required
        minLength={2}
        maxLength={60}
        disabled={!canEdit}
        hint={canEdit ? undefined : "Only Owners and Admins can change this."}
      />
      <TextField
        label="Workspace URL"
        value={`/w/${slug}`}
        readOnly
        disabled
        hint="Set when the workspace was created."
      />
      {canEdit && (
        <div>
          <Button type="submit" loading={rename.isPending}>
            {rename.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}
    </form>
  );
}
