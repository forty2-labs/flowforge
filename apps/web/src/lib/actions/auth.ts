"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  apiRequest,
  messageFrom,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "../api";
import type { FormState } from "../form-state";
import { safeNext } from "../session";

async function startSession(
  path: "/auth/signin" | "/auth/signup",
  body: Record<string, string>,
): Promise<void> {
  const response = await apiRequest(path, { method: "POST", body });
  const token = response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .find((pair) => pair.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!token) throw new Error("The API did not start a session.");

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function signIn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await startSession("/auth/signin", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  redirect(safeNext(formData.get("next")) ?? "/");
}

export async function signUp(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await startSession("/auth/signup", {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }
  redirect(safeNext(formData.get("next")) ?? "/");
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
