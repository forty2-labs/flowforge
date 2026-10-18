import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-1.5">
      <h1 className="text-page">{title}</h1>
      {description && (
        <p className="max-w-180 text-body text-fg-secondary">{description}</p>
      )}
    </header>
  );
}

// A titled part of a page. The heading sits above the panel, so the panel
// holds only the things you act on. A count is its own element, not part of
// the title text.
export function Section({
  title,
  count,
  flush = false,
  children,
}: {
  title: string;
  count?: number;
  /** For lists: rows bring their own padding and dividers. */
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-baseline gap-2 text-section">
        {title}
        {count !== undefined && (
          <span className="text-body font-medium text-fg-muted tabular-nums">
            {count}
          </span>
        )}
      </h2>
      <div
        className={
          flush
            ? "rounded-lg border border-line bg-surface px-5"
            : "flex flex-col gap-4 rounded-lg border border-line bg-surface p-5"
        }
      >
        {children}
      </div>
    </section>
  );
}
