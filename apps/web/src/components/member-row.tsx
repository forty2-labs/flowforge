"use client";

import { ROLE_LABELS, ROLES, type MemberDto, type Role } from "@flowforge/types";
import { Avatar, Badge, Button } from "@flowforge/ui";
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

  // Only an Owner can change an Owner or hand out ownership.
  const viewerIsOwner = viewerRole === "OWNER";
  const canEdit = canManage && (viewerIsOwner || member.role !== "OWNER");
  const roleOptions = ROLES.filter((role) => viewerIsOwner || role !== "OWNER");

  const run = (action: () => Promise<{ error?: string }>) => {
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      setError(result.error);
    });
  };

  const confirmRemove = () => {
    const question = isSelf
      ? "Leave this workspace? You’ll lose access immediately."
      : `Remove ${member.name}? They’ll lose access immediately.`;
    if (window.confirm(question)) {
      run(() => removeMember(slug, member.userId, isSelf));
    }
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
              const role = event.target.value;
              run(() => changeMemberRole(slug, member.userId, role));
            }}
            className="h-9 rounded-md border border-line-strong bg-surface px-2 text-input md:text-body"
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
          <Button variant="ghost" size="sm" disabled={pending} onClick={confirmRemove}>
            {isSelf ? "Leave" : "Remove"}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-label text-error">
          {error}
        </p>
      )}
    </li>
  );
}
