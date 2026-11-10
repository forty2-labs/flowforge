import type { SessionDto } from "@flowforge/types";
import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchJson, RequestError } from "./request";

// The signed-in person and their workspaces, or null when signed out.
// Sign-in and sign-up write it directly; signing out clears the whole cache.
export const sessionQuery = queryOptions({
  queryKey: queryKeys.session(),
  queryFn: async (): Promise<SessionDto | null> => {
    try {
      return await fetchJson<SessionDto>("/api/session");
    } catch (error) {
      if (error instanceof RequestError && error.status === 401) return null;
      throw error;
    }
  },
});
