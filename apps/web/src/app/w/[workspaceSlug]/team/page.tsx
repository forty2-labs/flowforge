import { can } from "@flowforge/types";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { InviteForm } from "@/components/invite-form";
import { PageHeader, Section } from "@/components/page-header";
import { TeamLists } from "@/components/team-lists";
import { getQueryClient } from "@/lib/query/client";
import { prefetchTeam } from "@/lib/query/prefetch";
import { requireWorkspace } from "@/lib/session";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage({
  params,
}: PageProps<"/w/[workspaceSlug]/team">) {
  const { workspaceSlug } = await params;
  const { session, workspace } = await requireWorkspace(workspaceSlug);
  const canManage = can(workspace.role, "team.manage");

  const queryClient = getQueryClient();
  await prefetchTeam(queryClient, workspace.slug, canManage);

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

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TeamLists
          slug={workspace.slug}
          viewerId={session.user.id}
          viewerRole={workspace.role}
          canManage={canManage}
        />
      </HydrationBoundary>
    </>
  );
}
