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

// A titled part of a page. The heading sits above a glass panel, so the panel
// holds only the things you act on. A count is a highlight pill, its own
// element rather than part of the title text.
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
      <h2 className="flex items-center gap-2 text-section">
        {title}
        {count !== undefined && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-highlight px-1.5 text-helper font-semibold text-on-highlight tabular-nums">
            {count}
          </span>
        )}
      </h2>
      <div
        className={
          flush
            ? "glass rounded-lg px-5"
            : "glass flex flex-col gap-4 rounded-lg p-5"
        }
      >
        {children}
      </div>
    </section>
  );
}
