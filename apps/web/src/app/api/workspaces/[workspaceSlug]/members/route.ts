import { forwardGet } from "@/lib/route-handler";

// The browser's read of `membersQuery`.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/workspaces/[workspaceSlug]/members">,
): Promise<Response> {
  const { workspaceSlug } = await params;
  return forwardGet(`/workspaces/${encodeURIComponent(workspaceSlug)}/members`);
}
