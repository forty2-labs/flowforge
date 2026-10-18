import type { ReactNode } from 'react';
import { cx } from './cx';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-sunken text-fg-secondary',
  primary: 'bg-primary-soft text-on-primary-soft',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  info: 'bg-info-soft text-info',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-sm px-1.5 py-0.5 text-helper font-semibold whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
