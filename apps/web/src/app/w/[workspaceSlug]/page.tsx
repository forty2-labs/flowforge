import { can, ROLE_LABELS, type MemberDto } from "@flowforge/types";
import Link from "next/link";
import { Card, PageHeader } from "@/components/page-header";
import { api } from "@/lib/api";
import { requireWorkspace } from "@/lib/session";

export default async function OverviewPage({
  params,
}: PageProps<"/w/[workspaceSlug]">) {
  const { workspaceSlug } = await params;
  const { session, workspace } = await requireWorkspace(workspaceSlug);
  const members = await api<MemberDto[]>(`/workspaces/${workspace.slug}/members`);
  const firstName = session.user.name.split(/\s+/)[0];

  return (
    <>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description={`Your role in ${workspace.name} is ${ROLE_LABELS[workspace.role]}.`}
      />
      <Card title="Team">
        <p className="text-body text-fg-secondary">
          {members.length === 1
            ? "You’re the only person here so far."
            : `${members.length} people work in this workspace.`}
        </p>
        <div>
          <Link href={`/w/${workspace.slug}/team`} className="text-body font-medium">
            {can(workspace.role, "team.manage") ? "Invite your team" : "See the team"}
          </Link>
        </div>
      </Card>
    </>
  );
}
