import type { ReactNode } from 'react';
import { cx } from './cx';

// A phone outline around an app screen preview. The screen is a solid
// surface, with a status bar and a home indicator.
export function PhoneFrame({
  children,
  className,
  screenClassName,
}: {
  children: ReactNode;
  className?: string;
  /** Overrides for the screen, such as a shorter min-height. */
  screenClassName?: string;
}) {
  return (
    <div className={cx('w-60 max-w-full flex-none rounded-xl border border-line-strong bg-sunken p-2', className)}>
      <div className={cx('flex min-h-110 flex-col overflow-hidden rounded-lg bg-surface', screenClassName)}>
        <div aria-hidden="true" className="flex items-center justify-between px-4 pt-2 pb-1 text-helper font-medium text-fg tabular-nums">
          <span>9:41</span>
          <span className="h-1.5 w-1/4 max-w-12 rounded-full bg-line-strong" />
          <span className="h-2 w-5 rounded-sm border border-fg-muted" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        <span aria-hidden="true" className="mx-auto mt-2 mb-2 h-1 w-20 rounded-full bg-line-strong" />
      </div>
    </div>
  );
}
