"use client";

import { ROLE_LABELS, type InvitationDto } from "@flowforge/types";
import { Badge, Button, ConfirmDialog, StatusMark, useToast } from "@flowforge/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { resendInvitation, revokeInvitation } from "@/lib/actions/team";
import { queryKeys } from "@/lib/query/keys";
import { requestErrorMessage, runAction } from "@/lib/query/request";
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
  const [confirming, setConfirming] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.invitations(slug) });

  // A new link keeps the invitation's id and moves its expiry.
  const resend = useMutation({
    mutationFn: () => runAction(() => resendInvitation(slug, invitation.id)),
    onSuccess: refresh,
  });
  const revoke = useMutation({
    mutationFn: () => runAction(() => revokeInvitation(slug, invitation.id)),
    onSuccess: () => {
      toast({ message: `Invitation to ${invitation.email} revoked.` });
      return refresh();
    },
  });
  const pending = resend.isPending || revoke.isPending;
  const error = resend.error ?? revoke.error;

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
          onClick={() => {
            revoke.reset();
            resend.mutate();
          }}
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
      {error && (
        <p role="alert" className="text-label text-error">
          {requestErrorMessage(error)}
        </p>
      )}
      {resend.data && <InviteLink {...resend.data} />}
      <ConfirmDialog
        open={confirming}
        title={`Revoke the invitation to ${invitation.email}?`}
        confirmLabel="Revoke invitation"
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          resend.reset();
          revoke.mutate();
        }}
      >
        The link stops working straight away. You can invite them again later.
      </ConfirmDialog>
    </li>
  );
}
