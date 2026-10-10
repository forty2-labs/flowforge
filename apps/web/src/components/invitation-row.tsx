"use client";

import { ROLE_LABELS, type InvitationDto } from "@flowforge/types";
import { Badge, Button } from "@flowforge/ui";
import { useState, useTransition } from "react";
import {
  resendInvitation,
  revokeInvitation,
  type InviteState,
} from "@/lib/actions/team";
import { InviteLink } from "./invite-link";

export function InvitationRow({
  slug,
  invitation,
  expiresLabel,
}: {
  slug: string;
  invitation: InvitationDto;
  expiresLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<InviteState>({});

  return (
    <li className="flex flex-col gap-2 border-b border-line py-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-[1_1_160px] flex-col">
          <span className="truncate text-[15px] font-semibold">{invitation.email}</span>
          <span className="text-[13px] text-fg-muted">{expiresLabel}</span>
        </div>
        <Badge>{ROLE_LABELS[invitation.role]}</Badge>
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setState(await resendInvitation(slug, invitation.id));
            })
          }
        >
          New link
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setState(await revokeInvitation(slug, invitation.id));
            })
          }
        >
          Revoke
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="text-[13px] text-error">
          {state.error}
        </p>
      )}
      {state.acceptUrl && state.email && (
        <InviteLink email={state.email} url={state.acceptUrl} />
      )}
    </li>
  );
}
