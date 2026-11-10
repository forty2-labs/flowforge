"use client";

import { Alert, Button } from "@flowforge/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { acceptInvitation } from "@/lib/actions/team";
import { queryKeys } from "@/lib/query/keys";
import { requestErrorMessage, runAction } from "@/lib/query/request";

export function AcceptInvitation({ token }: { token: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accept = useMutation({
    mutationFn: () => runAction(() => acceptInvitation(token)),
    onSuccess: (workspace) => {
      // The session lists the person's workspaces; the new one has a new member.
      void queryClient.invalidateQueries({ queryKey: queryKeys.session() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspace.slug) });
      router.push(`/w/${workspace.slug}`);
    },
  });
  // Stay busy until the workspace replaces this page.
  const pending = accept.isPending || accept.isSuccess;

  async function action() {
    await accept.mutateAsync().catch(() => {
      // Shown from accept.error below.
    });
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      {accept.error && <Alert tone="error">{requestErrorMessage(accept.error)}</Alert>}
      <Button type="submit" size="lg" loading={pending}>
        {pending ? "Joining…" : "Accept invitation"}
      </Button>
    </form>
  );
}
