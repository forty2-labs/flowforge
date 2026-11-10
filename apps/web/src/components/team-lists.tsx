"use client";

import type { Role } from "@flowforge/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { invitationsQuery, membersQuery } from "@/lib/query/team";
import { InvitationRow } from "./invitation-row";
import { MemberRow } from "./member-row";
import { Section } from "./page-header";

const EXPIRY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

// The Team screen's lists. The page prefetches both queries on the server, so
// they render at once; mutations in the rows invalidate them.
export function TeamLists({
  slug,
  viewerId,
  viewerRole,
  canManage,
}: {
  slug: string;
  viewerId: string;
  viewerRole: Role;
  canManage: boolean;
}) {
  const { data: members } = useSuspenseQuery(membersQuery(slug));
  return (
    <>
      <Section title="Members" count={members.length} flush>
        <ul className="flex flex-col">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              slug={slug}
              member={member}
              isSelf={member.userId === viewerId}
              viewerRole={viewerRole}
              canManage={canManage}
            />
          ))}
        </ul>
      </Section>
      {canManage && <PendingInvitations slug={slug} />}
    </>
  );
}

function PendingInvitations({ slug }: { slug: string }) {
  const { data: invitations } = useSuspenseQuery(invitationsQuery(slug));
  if (invitations.length === 0) return null;
  return (
    <Section title="Pending invitations" count={invitations.length} flush>
      <ul className="flex flex-col">
        {invitations.map((invitation) => (
          <InvitationRow
            key={invitation.id}
            slug={slug}
            invitation={invitation}
            expiresLabel={`Expires ${EXPIRY_FORMAT.format(new Date(invitation.expiresAt))}`}
          />
        ))}
      </ul>
    </Section>
  );
}
