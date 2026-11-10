"use server";

import type { SessionDto } from "@flowforge/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  apiRequest,
  messageFrom,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "../api";
import type { ActionResult } from "../form-state";
import { safeNext } from "../session";

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
  path: "/auth/signin" | "/auth/signup",
  body: Record<string, string>,
  next: unknown,
): Promise<ActionResult<AuthSuccess>> {
  let response: Response;
  try {
    response = await apiRequest(path, { method: "POST", body });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  const token = response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .find((pair) => pair.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!token) return { error: "The API did not start a session." };

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return {
    data: {
      session: (await response.json()) as SessionDto,
      redirectTo: safeNext(next) ?? "/",
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

export async function signOut(): Promise<void> {
  try {
    await apiRequest("/auth/signout", { method: "POST" });
  } catch {
    // The local cookie is cleared either way.
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/signin");
}
