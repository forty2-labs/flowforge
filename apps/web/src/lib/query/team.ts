import type { InvitationDto, MemberDto } from "@flowforge/types";
import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchJson } from "./request";

// A workspace's members. The overview and Team pages share this entry, and
// every team mutation invalidates it.
export const membersQuery = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.members(slug),
    queryFn: () =>
      fetchJson<MemberDto[]>(`/api/workspaces/${encodeURIComponent(slug)}/members`),
  });

// Pending invitations. Only people with `team.manage` may read them.
export const invitationsQuery = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.invitations(slug),
    queryFn: () =>
      fetchJson<InvitationDto[]>(
        `/api/workspaces/${encodeURIComponent(slug)}/invitations`,
      ),
  });
