import "server-only";
import type { ApiError } from "@flowforge/types";
import { api, ApiRequestError, messageFrom } from "./api";

// Answers a browser read from TanStack Query with the API's response for
// `path`, sending the session cookie from this server. An API error keeps its
// status, so a 401, 403 or 404 reaches the browser unchanged.
export async function forwardGet(path: string): Promise<Response> {
  try {
    return Response.json(await api<unknown>(path));
  } catch (error) {
    const status = error instanceof ApiRequestError ? error.status : 502;
    return Response.json(
      { statusCode: status, message: messageFrom(error) } satisfies ApiError,
      { status },
    );
  }
}
