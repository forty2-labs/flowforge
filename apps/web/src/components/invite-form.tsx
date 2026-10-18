"use client";

import { ROLE_LABELS, ROLES } from "@flowforge/types";
import { Alert, Button, TextField } from "@flowforge/ui";
import { useActionState } from "react";
import { inviteMember, type InviteState } from "@/lib/actions/team";
import { InviteLink } from "./invite-link";

const INITIAL: InviteState = {};

export function InviteForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(
    inviteMember.bind(null, slug),
    INITIAL,
  );
  return (
    <div className="flex flex-col gap-3">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <TextField
            label="Email"
            name="email"
            type="email"
            required
            placeholder="tom@northstar.studio"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="invite-role" className="text-label font-medium">
            Role
          </label>
          <select
            id="invite-role"
            name="role"
            defaultValue="EDITOR"
            className="h-11 rounded-lg border border-line-input bg-surface px-3 text-control"
          >
            {ROLES.filter((role) => role !== "OWNER").map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" loading={pending}>
          {pending ? "Inviting…" : "Invite"}
        </Button>
      </form>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.acceptUrl && state.email && (
        <InviteLink email={state.email} url={state.acceptUrl} />
      )}
    </div>
  );
}
