import { can, ROLE_LABELS, type MemberDto } from "@flowforge/types";
import { Avatar } from "@flowforge/ui";
import Link from "next/link";
import { PageHeader, Section } from "@/components/page-header";
import { api } from "@/lib/api";
import { requireWorkspace } from "@/lib/session";

const SHOWN_AVATARS = 5;

export default async function OverviewPage({
  params,
}: PageProps<"/w/[workspaceSlug]">) {
  const { workspaceSlug } = await params;
  const { session, workspace } = await requireWorkspace(workspaceSlug);
  const members = await api<MemberDto[]>(`/workspaces/${workspace.slug}/members`);
  const firstName = session.user.name.split(/\s+/)[0];
  const extra = members.length - SHOWN_AVATARS;

  return (
    <>
      <PageHeader
        title={workspace.name}
        description={`Welcome, ${firstName}. Your role here is ${ROLE_LABELS[workspace.role]}.`}
      />
      <Section title="Team" count={members.length}>
        <div className="flex flex-wrap items-center gap-4">
          <ul aria-label="Members" className="flex -space-x-2">
            {members.slice(0, SHOWN_AVATARS).map((member) => (
              <li key={member.userId} title={member.name}>
                <Avatar name={member.name} className="ring-2 ring-surface" />
              </li>
            ))}
            {extra > 0 && (
              <li className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-sunken px-1.5 text-helper font-semibold text-fg-secondary ring-2 ring-surface">
                +{extra}
              </li>
            )}
          </ul>
          <p className="min-w-0 flex-1 text-body text-fg-secondary">
            {members.length === 1
              ? "You’re the only person here so far."
              : `${members.length} people work in this workspace.`}
          </p>
          <Link
            href={`/w/${workspace.slug}/team`}
            className="text-body font-medium"
          >
            {can(workspace.role, "team.manage") ? "Invite your team" : "See the team"}
          </Link>
        </div>
      </Section>
    </>
  );
}
