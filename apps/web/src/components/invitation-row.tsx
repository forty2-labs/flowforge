"use client";

import { ROLE_LABELS, type InvitationDto } from "@flowforge/types";
import { Badge, Button, ConfirmDialog, StatusMark, useToast } from "@flowforge/ui";
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
  const [confirming, setConfirming] = useState(false);
  const toast = useToast();

  return (
    <li className="flex flex-col gap-2 border-b border-line py-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-[1_1_160px] flex-col">
          <span className="truncate text-title">{invitation.email}</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-fg-muted">
            <StatusMark status="pending" className="text-fg-secondary" />
            <span>{expiresLabel}</span>
          </span>
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
          onClick={() => setConfirming(true)}
        >
          Revoke
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="text-label text-error">
          {state.error}
        </p>
      )}
      {state.acceptUrl && state.email && (
        <InviteLink email={state.email} url={state.acceptUrl} />
      )}
      <ConfirmDialog
        open={confirming}
        title={`Revoke the invitation to ${invitation.email}?`}
        confirmLabel="Revoke invitation"
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          startTransition(async () => {
            const result = await revokeInvitation(slug, invitation.id);
            setState(result);
            if (!result.error) {
              toast({ message: `Invitation to ${invitation.email} revoked.` });
            }
          });
        }}
      >
        The link stops working straight away. You can invite them again later.
      </ConfirmDialog>
    </li>
  );
}
