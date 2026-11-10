import type { ApiError } from "@flowforge/types";
import type { ActionResult } from "../form-state";

const CONNECTION_MESSAGE =
  "Couldn’t reach Flowforge. Check your connection and try again.";

// A failed read or mutation, carrying the text shown to the person. `status`
// is set when the failure came back as an HTTP response.
export class RequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

// GETs one of this app's route handlers under /api. The browser never calls
// the NestJS API itself; the handler forwards the session cookie from the server.
export async function fetchJson<T>(path: `/api/${string}`): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { headers: { accept: "application/json" } });
  } catch {
    throw new RequestError(CONNECTION_MESSAGE);
  }
  if (!response.ok) {
    throw new RequestError(await errorMessage(response), response.status);
  }
  return (await response.json()) as T;
}

// Calls a server action from a mutation and turns its error result back
// into a thrown RequestError, so TanStack Query sees it as a failure.
export async function runAction<T>(
  action: () => Promise<ActionResult<T>>,
): Promise<T> {
  let result: ActionResult<T>;
  try {
    result = await action();
  } catch {
    throw new RequestError(CONNECTION_MESSAGE);
  }
  if (result.error !== undefined) throw new RequestError(result.error);
  return result.data;
}

// The text for a failed query or mutation, shown beside the form.
export function requestErrorMessage(error: unknown): string {
  return error instanceof RequestError ? error.message : CONNECTION_MESSAGE;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    return Array.isArray(body.message) ? body.message.join(" ") : body.message;
  } catch {
    return "Something went wrong. Try again.";
  }
}
