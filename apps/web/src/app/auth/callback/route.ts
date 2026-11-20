import type { WorkspaceDto } from "@flowforge/types";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { api, apiRequest, ApiRequestError } from "@/lib/api";
import type { GoogleSignInError } from "@/lib/google-sign-in";
import { safeNext } from "@/lib/session";
import { adoptSession } from "@/lib/session-cookie";
import { createSupabase } from "@/lib/supabase";

// Where Supabase sends the browser back after the Google sign-in. Exchanges
// the code for a Supabase session, has the API start an ff_session from its
// access token, and then signs out of Supabase.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get("next"));
  const code = params.get("code");
  // Google answers access_denied when the person backs out.
  if (!code) failed(params.get("error") === "access_denied" ? "cancelled" : "failed", next);

  const supabase = await createSupabase();
  if (!supabase) failed("unavailable", next);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) failed("failed", next);

  let token: string | null = null;
  let reason: GoogleSignInError = "failed";
  try {
    const response = await apiRequest("/auth/google", {
      method: "POST",
      body: { accessToken: data.session.access_token },
    });
    token = await adoptSession(response);
  } catch (apiError) {
    if (apiError instanceof ApiRequestError) {
      if (apiError.status === 409) reason = "conflict";
      if (apiError.status === 503) reason = "unavailable";
    }
  }
  // Clears Supabase's cookies and revokes its refresh token. From here on the
  // ff_session is the only session.
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  if (!token) failed(reason, next);

  redirect(await destination(next, token));
}

// Coming from an invitation link, accepts it and goes to the workspace. If
// that is refused, the invitation page explains why.
async function destination(next: string | null, sessionToken: string): Promise<string> {
  const invitation = next?.match(/^\/invite\/([\w-]+)$/);
  if (!invitation) return next ?? "/";
  try {
    const workspace = await api<WorkspaceDto>(`/invitations/${invitation[1]}/accept`, {
      method: "POST",
      sessionToken,
    });
    return `/w/${workspace.slug}`;
  } catch {
    return next!;
  }
}

function failed(reason: GoogleSignInError, next: string | null): never {
  const query = new URLSearchParams({ error: reason });
  if (next) query.set("next", next);
  redirect(`/signin?${query}`);
}
