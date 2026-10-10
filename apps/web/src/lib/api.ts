import "server-only";
import type { ApiError } from "@flowforge/types";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ff_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// The browser only ever talks to this Next.js server; the session cookie is
// forwarded to the API from here.
export async function apiRequest(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<Response> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const headers: Record<string, string> = {};
  if (token) headers.cookie = `${SESSION_COOKIE}=${token}`;
  if (init.body !== undefined) headers["content-type"] = "application/json";

  const response = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ApiRequestError(response.status, await errorMessage(response));
  }
  return response;
}

export async function api<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await apiRequest(path, init);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    return Array.isArray(body.message) ? body.message.join(" ") : body.message;
  } catch {
    return "Something went wrong. Try again.";
  }
}

// Turns a failed API call into the message shown beside the form.
export function messageFrom(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "Couldn’t reach Flowforge. Check your connection and try again.";
}
