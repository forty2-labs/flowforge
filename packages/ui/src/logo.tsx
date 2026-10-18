import { cx } from './cx';

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#2F43C8" />
      <path d="M10 9.5h12.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 16h8" stroke="#C9D2FF" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 9.5V23" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="22.5" cy="16" r="1.8" fill="#C9D2FF" />
    </svg>
  );
}

// The mark and the name, as one lockup. Colour follows the surrounding text.
export function Wordmark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      <span className="text-section font-bold">Flowforge</span>
    </span>
  );
}
