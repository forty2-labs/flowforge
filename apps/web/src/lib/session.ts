import "server-only";
import type { SessionDto, WorkspaceDto } from "@flowforge/types";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { api, ApiRequestError } from "./api";

// One session lookup per request, however many components ask.
export const getSession = cache(async (): Promise<SessionDto | null> => {
  try {
    return await api<SessionDto>("/auth/me");
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) return null;
    throw error;
  }
});

export async function requireSession(): Promise<SessionDto> {
  const session = await getSession();
  if (!session) redirect("/signin");
  return session;
}

export async function requireWorkspace(
  slug: string,
): Promise<{ session: SessionDto; workspace: WorkspaceDto }> {
  const session = await requireSession();
  const workspace = session.workspaces.find((item) => item.slug === slug);
  if (!workspace) notFound();
  return { session, workspace };
}

// Only same-site paths are accepted as a post-sign-in destination.
export function safeNext(next: unknown): string | null {
  if (typeof next !== "string") return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return null;
  }
  return next;
}
