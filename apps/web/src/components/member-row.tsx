"use client";

import { ROLE_LABELS, ROLES, type MemberDto, type Role } from "@flowforge/types";
import { Avatar, Badge, Button, ConfirmDialog, useToast } from "@flowforge/ui";
import { useState, useTransition } from "react";
import { changeMemberRole, removeMember } from "@/lib/actions/team";

export function MemberRow({
  slug,
  member,
  isSelf,
  viewerRole,
  canManage,
}: {
  slug: string;
  member: MemberDto;
  isSelf: boolean;
  viewerRole: Role;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const toast = useToast();

  // Only an Owner can change an Owner or hand out ownership.
  const viewerIsOwner = viewerRole === "OWNER";
  const canEdit = canManage && (viewerIsOwner || member.role !== "OWNER");
  const roleOptions = ROLES.filter((role) => viewerIsOwner || role !== "OWNER");

  // Errors stay next to the row they belong to; success is a toast.
  const run = (action: () => Promise<{ error?: string }>, success: string) => {
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      setError(result.error);
      if (!result.error) toast({ message: success });
    });
  };


  return (
    <li className="flex flex-col gap-2 border-b border-line py-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={member.name} />
        <div className="flex min-w-0 flex-[1_1_160px] flex-col">
          <span className="text-title">
            {member.name}
            {isSelf && <span className="font-normal text-fg-muted"> (you)</span>}
          </span>
          <span className="truncate text-label text-fg-muted">{member.email}</span>
        </div>
        {canEdit ? (
          <select
            aria-label={`Role for ${member.name}`}
            value={member.role}
            disabled={pending}
            onChange={(event) => {
              const role = event.target.value as Role;
              run(
                () => changeMemberRole(slug, member.userId, role),
                `${member.name} is now ${ROLE_LABELS[role]}.`,
              );
            }}
            className="h-11 rounded-md border border-line-input bg-surface px-2 text-input md:h-9 md:text-body pointer-coarse:h-11"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        ) : (
          <Badge tone={member.role === "OWNER" ? "primary" : "neutral"}>
            {ROLE_LABELS[member.role]}
          </Badge>
        )}
        {(canEdit || isSelf) && (
          <Button variant="ghost" size="sm" disabled={pending} onClick={() => setConfirming(true)}>
            {isSelf ? "Leave" : "Remove"}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-label text-error">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={confirming}
        title={isSelf ? "Leave this workspace?" : `Remove ${member.name}?`}
        confirmLabel={isSelf ? "Leave workspace" : "Remove member"}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          run(
            () => removeMember(slug, member.userId, isSelf),
            `${member.name} was removed.`,
          );
        }}
      >
        {isSelf
          ? "You’ll lose access immediately. An Owner or Admin can invite you back."
          : `${member.name} will lose access immediately. You can invite them again later.`}
      </ConfirmDialog>
    </li>
  );
}
