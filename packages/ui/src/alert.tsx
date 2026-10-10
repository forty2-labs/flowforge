import type { ReactNode } from 'react';
import { cx } from './cx';

type Tone = 'error' | 'warning' | 'info' | 'success';

const TONES: Record<Tone, string> = {
  error: 'bg-error-soft text-[#5C130C]',
  warning: 'bg-warning-soft text-[#8A4A00]',
  info: 'bg-info-soft text-[#17508F]',
  success: 'bg-success-soft text-[#1C6A41]',
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
      className={cx('rounded-lg px-3 py-2.5 text-[13.5px] leading-snug', TONES[tone], className)}
    >
      {children}
    </div>
  );
}
