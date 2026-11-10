// Every query key is built here, so a cache entry and the code that
// invalidates it can never disagree. Keys for data inside a workspace should
// start with ["workspace", slug] so one call can drop a whole workspace.
export const queryKeys = {
  session: () => ["session"] as const,
};
