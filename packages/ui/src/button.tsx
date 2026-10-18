import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-line-strong bg-surface text-fg hover:bg-sunken',
  ghost: 'text-fg-secondary hover:bg-sunken',
  danger: 'bg-error text-white hover:brightness-90',
};

// Touch screens get 44 px targets whatever the visual size.
const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-label pointer-coarse:h-11',
  md: 'h-9 px-3.5 text-body pointer-coarse:h-11',
  lg: 'h-11 px-4 text-title',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap',
        'transition-colors duration-[120ms] disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        >
          <path d="M12 3a9 9 0 1 1-9 9" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
