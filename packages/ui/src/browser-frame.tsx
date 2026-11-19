import type { ReactNode } from 'react';
import { cx } from './cx';

// A plain browser window around a page preview. The content area is a solid
// surface: what sits inside is customer content, never glass.
export function BrowserFrame({
  address,
  children,
  className,
}: {
  address: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex min-w-0 flex-col overflow-hidden rounded-lg border border-line-strong bg-surface', className)}>
      <div className="flex items-center gap-3 border-b border-line bg-sunken px-3 py-2">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-sm bg-surface px-2 py-0.5 font-mono text-helper text-fg-muted">
          {address}
        </span>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
