import { forwardGet } from "@/lib/route-handler";

// The browser's read of `invitationsQuery`. The API answers 403 below `team.manage`.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/workspaces/[workspaceSlug]/invitations">,
): Promise<Response> {
  const { workspaceSlug } = await params;
  return forwardGet(`/workspaces/${encodeURIComponent(workspaceSlug)}/invitations`);
}
