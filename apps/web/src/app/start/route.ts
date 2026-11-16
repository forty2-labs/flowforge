import type { SessionDto } from "@flowforge/types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api, ApiRequestError, SESSION_COOKIE } from "@/lib/api";

// The way into the app. Signed-in people land in their first workspace, or
// in onboarding. A session cookie the API no longer accepts is deleted and
// the visitor sees the public home page instead of being stuck on sign-in.
export async function GET(request: Request): Promise<Response> {
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));
  try {
    const session = await api<SessionDto>("/auth/me");
    const first = session.workspaces[0];
    return to(first ? `/w/${first.slug}` : "/workspaces/new");
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      (await cookies()).delete(SESSION_COOKIE);
      return to("/");
    }
    throw error;
  }
}
