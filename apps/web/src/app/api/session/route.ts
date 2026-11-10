import type { ApiError } from "@flowforge/types";
import { getSession } from "@/lib/session";

// The browser's read of the session for TanStack Query (`sessionQuery`).
// It goes through this server so the session cookie never leaves the web origin.
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return Response.json(
      { statusCode: 401, message: "Sign in to continue." } satisfies ApiError,
      { status: 401 },
    );
  }
  return Response.json(session);
}
