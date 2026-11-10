import { isServer, QueryClient } from "@tanstack/react-query";
import { RequestError } from "./request";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data rendered on the server is not refetched the moment it hydrates.
        staleTime: 60_000,
        // A 4xx answer will not change on retry; network and 5xx failures might.
        retry: (failures, error) =>
          failures < 2 &&
          !(error instanceof RequestError && error.status !== undefined && error.status < 500),
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// A new client for every server render, so no cache is shared between
// requests; one client for the life of the browser tab.
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
