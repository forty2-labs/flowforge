"use server";

import type { EmailVerifiedDto, SessionDto } from "@flowforge/types";
import { cookies, headers } from "next/headers";
import { actionResult, api, apiRequest, messageFrom, SESSION_COOKIE } from "../api";
import type { ActionResult } from "../form-state";
import { safeNext } from "../session";
import { adoptSession } from "../session-cookie";
import { createSupabase } from "../supabase";

export interface SignInInput {
  email: string;
  password: string;
  next?: string;
}

export interface SignUpInput extends SignInInput {
  name: string;
}

// The new session, and the same-site path to continue to.
export interface AuthSuccess {
  session: SessionDto;
  redirectTo: string;
}

async function startSession(
  path: "/auth/signin" | "/auth/signup" | "/auth/password/reset",
  body: Record<string, string>,
  next: unknown,
): Promise<ActionResult<AuthSuccess>> {
  let response: Response;
  try {
    response = await apiRequest(path, { method: "POST", body });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  if (!(await adoptSession(response))) return { error: "The API did not start a session." };
  return {
    data: {
      session: (await response.json()) as SessionDto,
      redirectTo: safeNext(next) ?? "/start",
    },
  };
}

// Called from a TanStack Query mutation in AuthForm, which caches the
// session and navigates on success.
export async function signIn(input: SignInInput): Promise<ActionResult<AuthSuccess>> {
  return startSession(
    "/auth/signin",
    { email: String(input.email ?? ""), password: String(input.password ?? "") },
    input.next,
  );
}

export async function signUp(input: SignUpInput): Promise<ActionResult<AuthSuccess>> {
  return startSession(
    "/auth/signup",
    {
      name: String(input.name ?? ""),
      email: String(input.email ?? ""),
      password: String(input.password ?? ""),
    },
    input.next,
  );
}

// Called from GoogleSignIn, which sends the browser to the returned Google
// sign-in page. Supabase Auth runs that step and comes back to /auth/callback,
// which finishes signing in.
export async function startGoogleSignIn(next: string): Promise<ActionResult<{ url: string }>> {
  const supabase = await createSupabase();
  if (!supabase) return { error: "Google sign-in isn’t set up here yet." };

  // Server actions only run for same-origin requests, so this is our origin.
  const origin = (await headers()).get("origin");
  if (!origin) return { error: "Couldn’t start Google sign-in. Try again." };
  const callback = new URL("/auth/callback", origin);
  const destination = safeNext(next);
  if (destination) callback.searchParams.set("next", destination);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
      skipBrowserRedirect: true,
      // Lets someone with several Google accounts choose, even after signing out.
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) return { error: "Couldn’t start Google sign-in. Try again." };
  return { data: { url: data.url } };
}

// Called from ForgotPasswordForm. The API answers the same whether or not
// the account exists.
export async function requestPasswordReset(email: string): Promise<ActionResult<null>> {
  return actionResult(async () => {
    await api("/auth/password/forgot", {
      method: "POST",
      body: { email: String(email ?? "") },
    });
    return null;
  });
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

// Called from ResetPasswordForm. The API signs out every other session and
// starts one here, so the person lands signed in.
export async function resetPassword(
  input: ResetPasswordInput,
): Promise<ActionResult<AuthSuccess>> {
  return startSession(
    "/auth/password/reset",
    { token: String(input.token ?? ""), password: String(input.password ?? "") },
    "/",
  );
}

// Called from VerifyEmail. Works signed in or out, so the link can be opened
// in any browser.
export async function verifyEmail(token: string): Promise<ActionResult<EmailVerifiedDto>> {
  return actionResult(() =>
    api<EmailVerifiedDto>("/auth/email/verify", {
      method: "POST",
      body: { token: String(token ?? "") },
    }),
  );
}

// Called from VerifyEmailNotice. The API sends nothing if a link went out in
// the last minute, so repeated clicks are harmless.
export async function resendVerification(): Promise<ActionResult<null>> {
  return actionResult(async () => {
    await api("/auth/email/resend", { method: "POST" });
    return null;
  });
}

// Called from a TanStack Query mutation in AccountMenu, which clears the
// cache and navigates to sign-in.
export async function signOut(): Promise<ActionResult<null>> {
  try {
    await apiRequest("/auth/signout", { method: "POST" });
  } catch {
    // The local cookie is cleared either way.
  }
  (await cookies()).delete(SESSION_COOKIE);
  return { data: null };
}
