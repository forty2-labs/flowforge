// Each workspace section needs its own boundary: one in the shared layout is
// already mounted when moving between sections, so it would not show. New
// sections re-export this from their own loading.tsx.
export default function Loading() {
  return <p className="text-sm text-fg-muted">Loading…</p>;
}
