"use client";

import { ROLE_LABELS, type Role } from "@flowforge/types";
import { Avatar, cx } from "@flowforge/ui";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { invitationsQuery, membersQuery } from "@/lib/query/team";

const SHOWN_AVATARS = 5;

// The overview's stat tiles, from the queries the page prefetched.
export function OverviewTiles({
  slug,
  role,
  canManage,
}: {
  slug: string;
  role: Role;
  canManage: boolean;
}) {
  const { data: members } = useSuspenseQuery(membersQuery(slug));
  // Not prefetched, and never read, below `team.manage`.
  const { data: invitations = [] } = useQuery({ ...invitationsQuery(slug), enabled: canManage });
  const extra = members.length - SHOWN_AVATARS;
  const team = `/w/${slug}/team`;

  // Stat tiles: a label, an action, and one big figure each.
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Tile title="People" href={team} linkLabel={canManage ? "Invite your team" : "See the team"}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Stat value={members.length} unit={members.length === 1 ? "person" : "people"} />
          <ul aria-label="Members" className="flex -space-x-2">
            {members.slice(0, SHOWN_AVATARS).map((member) => (
              <li key={member.userId} title={member.name}>
                <Avatar name={member.name} className="h-9 w-9 ring-2 ring-(--ff-glass-solid)" />
              </li>
            ))}
            {extra > 0 && (
              <li className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-sunken px-1.5 text-helper font-semibold text-fg-secondary ring-2 ring-(--ff-glass-solid)">
                +{extra}
              </li>
            )}
          </ul>
        </div>
      </Tile>
      {canManage && (
        <Tile title="Pending invitations" href={team} linkLabel="Manage">
          <Stat value={invitations.length} unit="waiting to join" />
        </Tile>
      )}
      <Tile title="Your role" className={canManage ? "md:col-span-2 xl:col-span-1" : undefined}>
        <p className="text-stat">{ROLE_LABELS[role]}</p>
      </Tile>
    </div>
  );
}

function Tile({
  title,
  href,
  linkLabel,
  className,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={cx("glass flex min-h-44 flex-col justify-between gap-6 rounded-lg p-5", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-title">{title}</h2>
        {href && linkLabel && (
          <Link href={href} className="text-label font-medium">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// A big figure with its unit, the way a dashboard reads at a glance.
function Stat({ value, unit }: { value: number; unit: string }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="text-stat tabular-nums">{value}</span>
      <span className="text-body text-fg-muted">{unit}</span>
    </p>
  );
}
