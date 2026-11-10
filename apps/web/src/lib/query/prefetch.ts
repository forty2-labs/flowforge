import "server-only";
import type { InvitationDto, MemberDto } from "@flowforge/types";
import type { QueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { invitationsQuery, membersQuery } from "./team";

// Fills a server render's query client with a workspace's team, read straight
// from the API, so the client components that hydrate it never suspend on the
// first render. fetchQuery, not prefetchQuery, so a failure reaches the page's
// error boundary instead of being retried from the browser.
export async function prefetchTeam(
  queryClient: QueryClient,
  slug: string,
  canManage: boolean,
): Promise<void> {
  const base = `/workspaces/${slug}`;
  await Promise.all([
    queryClient.fetchQuery({
      ...membersQuery(slug),
      queryFn: () => api<MemberDto[]>(`${base}/members`),
    }),
    canManage &&
      queryClient.fetchQuery({
        ...invitationsQuery(slug),
        queryFn: () => api<InvitationDto[]>(`${base}/invitations`),
      }),
  ]);
}
