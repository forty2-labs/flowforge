import type { ReactNode } from 'react';
import { cx } from './cx';

type Tone = 'error' | 'warning' | 'info' | 'success';

const TONES: Record<Tone, string> = {
  error: 'bg-error-soft text-error-strong',
  warning: 'bg-warning-soft text-warning-strong',
  info: 'bg-info-soft text-info-strong',
  success: 'bg-success-soft text-success-strong',
};

export function Alert({
  tone = 'info',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('rounded-lg px-3 py-2.5 text-body', TONES[tone], className)}
    >
      {children}
    </div>
  );
}
