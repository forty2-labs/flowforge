import { cx } from './cx';

// A placeholder block shaped like the content that is loading. Wrap a group
// of these in a container with `ff-delayed` so quick loads never flash.
export function Skeleton({ round = false, className }: { round?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx('block bg-sunken', round ? 'rounded-full' : 'rounded-md', className)}
    />
  );
}
