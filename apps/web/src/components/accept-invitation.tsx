"use client";

import { Alert, Button } from "@flowforge/ui";
import { useActionState } from "react";
import { acceptInvitation } from "@/lib/actions/team";
import { EMPTY_FORM_STATE } from "@/lib/form-state";

export function AcceptInvitation({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    acceptInvitation.bind(null, token),
    EMPTY_FORM_STATE,
  );
  return (
    <form action={action} className="flex flex-col gap-3">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Button type="submit" size="lg" loading={pending}>
        {pending ? "Joining…" : "Accept invitation"}
      </Button>
    </form>
  );
}
