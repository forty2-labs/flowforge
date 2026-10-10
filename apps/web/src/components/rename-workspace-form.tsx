"use client";

import { Alert, Button, TextField } from "@flowforge/ui";
import { useActionState } from "react";
import { renameWorkspace } from "@/lib/actions/workspaces";
import { EMPTY_FORM_STATE } from "@/lib/form-state";

export function RenameWorkspaceForm({
  slug,
  name,
  canEdit,
}: {
  slug: string;
  name: string;
  canEdit: boolean;
}) {
  const [state, action, pending] = useActionState(
    renameWorkspace.bind(null, slug),
    EMPTY_FORM_STATE,
  );
  return (
    <form action={action} className="flex max-w-[480px] flex-col gap-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.notice && <Alert tone="success">{state.notice}</Alert>}
      <TextField
        label="Workspace name"
        name="name"
        defaultValue={name}
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
          <Button type="submit" loading={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}
    </form>
  );
}
