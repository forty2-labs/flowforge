// Every query key is built here, so a cache entry and the code that
// invalidates it can never disagree. Keys for data inside a workspace start
// with ["workspace", slug] so one call can drop a whole workspace.
export const queryKeys = {
  session: () => ["session"] as const,
  workspace: (slug: string) => ["workspace", slug] as const,
  members: (slug: string) => ["workspace", slug, "members"] as const,
  invitations: (slug: string) => ["workspace", slug, "invitations"] as const,
};
