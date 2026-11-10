import { can } from "@flowforge/types";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { OverviewTiles } from "@/components/overview-tiles";
import { PageHeader } from "@/components/page-header";
import { getQueryClient } from "@/lib/query/client";
import { prefetchTeam } from "@/lib/query/prefetch";
import { requireWorkspace } from "@/lib/session";

export default async function OverviewPage({
  params,
}: PageProps<"/w/[workspaceSlug]">) {
  const { workspaceSlug } = await params;
  const { session, workspace } = await requireWorkspace(workspaceSlug);
  const canManage = can(workspace.role, "team.manage");
  const firstName = session.user.name.split(/\s+/)[0];

  // The same cache entries as the Team screen, so moving between them is instant.
  const queryClient = getQueryClient();
  await prefetchTeam(queryClient, workspace.slug, canManage);

  return (
    <>
      <PageHeader
        title={workspace.name}
        description={`Welcome, ${firstName}. Here is where your workspace stands.`}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <OverviewTiles slug={workspace.slug} role={workspace.role} canManage={canManage} />
      </HydrationBoundary>
    </>
  );
}
