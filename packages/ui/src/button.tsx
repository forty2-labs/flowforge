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
  primary: 'bg-primary text-on-primary hover:bg-primary-hover hover:text-on-primary',
  // Solid ink on light, solid white on dark: strong, but never the signal.
  secondary: 'bg-contrast text-on-contrast hover:bg-contrast-hover hover:text-on-contrast',
  ghost: 'text-fg-secondary hover:bg-sunken hover:text-fg',
  danger: 'bg-danger text-on-primary hover:brightness-110 hover:text-on-primary',
};

// Touch screens get 44 px targets whatever the visual size.
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-label pointer-coarse:h-11',
  md: 'h-11 px-5 text-body',
  lg: 'h-12 px-6 text-title',
};

// Bold pills: fully rounded, semibold. Exported so a link that acts as a
// button (a call to action that navigates) looks exactly like one.
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}): string {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap',
    'transition-[background-color,color,transform] duration-[120ms] active:translate-y-px motion-reduce:active:translate-y-0',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

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
      className={buttonClasses({ variant, size, className })}
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
