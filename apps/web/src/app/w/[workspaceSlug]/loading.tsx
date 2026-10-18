import { Skeleton } from "@flowforge/ui";

// Each workspace section needs its own boundary: one in the shared layout is
// already mounted when moving between sections, so it would not show. New
// sections re-export this from their own loading.tsx, or export a skeleton
// shaped like their own content.
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="ff-delayed flex flex-col gap-6">
      <span className="sr-only">Loading</span>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-32" />
        <div className="rounded-lg border border-line bg-surface px-5">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="flex items-center gap-3 border-b border-line py-4 last:border-b-0"
            >
              <Skeleton round className="h-8 w-8" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-40 max-w-full" />
                <Skeleton className="h-3 w-56 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
