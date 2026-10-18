import { cx } from './cx';

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters.map((word) => word[0]?.toUpperCase() ?? '').join('') || '?';
}

export function Avatar({
  name,
  shape = 'circle',
  className,
}: {
  name: string;
  shape?: 'circle' | 'square';
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex h-8 w-8 flex-none items-center justify-center bg-primary-soft text-helper font-semibold text-on-primary-soft',
        shape === 'circle' ? 'rounded-full' : 'rounded-[7px]',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
