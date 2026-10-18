import { can, type InvitationDto, type MemberDto } from "@flowforge/types";
import type { Metadata } from "next";
import { InvitationRow } from "@/components/invitation-row";
import { InviteForm } from "@/components/invite-form";
import { MemberRow } from "@/components/member-row";
import { PageHeader, Section } from "@/components/page-header";
import { api } from "@/lib/api";
import { requireWorkspace } from "@/lib/session";

export const metadata: Metadata = { title: "Team" };

const EXPIRY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export default async function TeamPage({
  params,
}: PageProps<"/w/[workspaceSlug]/team">) {
  const { workspaceSlug } = await params;
  const { session, workspace } = await requireWorkspace(workspaceSlug);
  const canManage = can(workspace.role, "team.manage");
  const base = `/workspaces/${workspace.slug}`;

  const [members, invitations] = await Promise.all([
    api<MemberDto[]>(`${base}/members`),
    canManage ? api<InvitationDto[]>(`${base}/invitations`) : [],
  ]);

  return (
    <>
      <PageHeader
        title="Team"
        description="Everyone with access to this workspace, and what they can do in it."
      />

      {canManage && (
        <Section title="Invite someone">
          <InviteForm slug={workspace.slug} />
        </Section>
      )}

      <Section title="Members" count={members.length} flush>
        <ul className="flex flex-col">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              slug={workspace.slug}
              member={member}
              isSelf={member.userId === session.user.id}
              viewerRole={workspace.role}
              canManage={canManage}
            />
          ))}
        </ul>
      </Section>

      {canManage && invitations.length > 0 && (
        <Section title="Pending invitations" count={invitations.length} flush>
          <ul className="flex flex-col">
            {invitations.map((invitation) => (
              <InvitationRow
                key={invitation.id}
                slug={workspace.slug}
                invitation={invitation}
                expiresLabel={`Expires ${EXPIRY_FORMAT.format(new Date(invitation.expiresAt))}`}
              />
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
