"use client";

import { Alert, Button, TextField } from "@flowforge/ui";
import { useActionState } from "react";
import { createWorkspace } from "@/lib/actions/workspaces";
import { EMPTY_FORM_STATE } from "@/lib/form-state";

export function CreateWorkspaceForm() {
  const [state, action, pending] = useActionState(
    createWorkspace,
    EMPTY_FORM_STATE,
  );
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <TextField
        label="Workspace name"
        name="name"
        required
        minLength={2}
        maxLength={60}
        placeholder="Northstar Studio"
        hint="Usually your business or project. You can change it later."
      />
      <Button type="submit" size="lg" loading={pending}>
        {pending ? "Creating…" : "Create workspace"}
      </Button>
    </form>
  );
}
