"use client";

import { ROLE_LABELS, ROLES } from "@flowforge/types";
import { Alert, Button, TextField } from "@flowforge/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteMember, type InviteInput } from "@/lib/actions/team";
import { queryKeys } from "@/lib/query/keys";
import { requestErrorMessage, runAction } from "@/lib/query/request";
import { InviteLink } from "./invite-link";

export function InviteForm({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const invite = useMutation({
    mutationFn: (input: InviteInput) => runAction(() => inviteMember(slug, input)),
    // Returned, so the button stays busy until the new invitation is listed.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.invitations(slug) }),
  });
  // After a failure the fields come back as typed; after a success they clear.
  const retry = invite.isError ? invite.variables : undefined;

  async function action(formData: FormData) {
    await invite
      .mutateAsync({
        email: String(formData.get("email") ?? ""),
        role: String(formData.get("role") ?? ""),
      })
      .catch(() => {
        // Shown from invite.error below.
      });
  }

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
            defaultValue={retry?.email}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="invite-role" className="text-label font-medium">
            Role
          </label>
          <select
            id="invite-role"
            name="role"
            defaultValue={retry?.role ?? "EDITOR"}
            className="h-11 rounded-lg border border-line-input bg-surface px-3 text-control"
          >
            {ROLES.filter((role) => role !== "OWNER").map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" loading={invite.isPending}>
          {invite.isPending ? "Inviting…" : "Invite"}
        </Button>
      </form>
      {invite.error && <Alert tone="error">{requestErrorMessage(invite.error)}</Alert>}
      {invite.data && <InviteLink email={invite.data.email} url={invite.data.acceptUrl} />}
    </div>
  );
}
