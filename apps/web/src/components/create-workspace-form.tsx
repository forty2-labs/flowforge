"use client";

import { Alert, Button, TextField } from "@flowforge/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createWorkspace } from "@/lib/actions/workspaces";
import { queryKeys } from "@/lib/query/keys";
import { requestErrorMessage, runAction } from "@/lib/query/request";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (input: { name: string }) => runAction(() => createWorkspace(input)),
    onSuccess: (workspace) => {
      // The session lists the person's workspaces.
      void queryClient.invalidateQueries({ queryKey: queryKeys.session() });
      router.push(`/w/${workspace.slug}`);
    },
  });
  // Stay busy until the new workspace replaces this page.
  const pending = create.isPending || create.isSuccess;

  async function action(formData: FormData) {
    await create
      .mutateAsync({ name: String(formData.get("name") ?? "") })
      .catch(() => {
        // Shown from create.error below.
      });
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {create.error && <Alert tone="error">{requestErrorMessage(create.error)}</Alert>}
      <TextField
        label="Workspace name"
        name="name"
        required
        minLength={2}
        maxLength={60}
        placeholder="Northstar Studio"
        hint="Usually your business or project. You can change it later."
        defaultValue={create.variables?.name}
      />
      <Button type="submit" size="lg" loading={pending}>
        {pending ? "Creating…" : "Create workspace"}
      </Button>
    </form>
  );
}
