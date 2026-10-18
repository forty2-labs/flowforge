import { cx } from './cx';

// The lifecycle mark. The logo ends in a dot, work reaching a finished
// point, and the same dot marks status: an empty ring is a draft, a filled
// dot is published. Every status in the product goes through this component.
export type Status = 'draft' | 'published' | 'changed' | 'archived' | 'pending' | 'expired';

const STATUSES: Record<Status, { label: string; tone: string; toneOnInk: string }> = {
  draft: { label: 'Draft', tone: 'text-fg-muted', toneOnInk: 'text-on-ink-muted' },
  published: { label: 'Published', tone: 'text-success', toneOnInk: 'text-success-on-ink' },
  changed: { label: 'Unpublished changes', tone: 'text-warning', toneOnInk: 'text-warning-on-ink' },
  archived: { label: 'Archived', tone: 'text-fg-muted', toneOnInk: 'text-on-ink-muted' },
  pending: { label: 'Pending', tone: 'text-info', toneOnInk: 'text-on-ink' },
  expired: { label: 'Expired', tone: 'text-fg-muted', toneOnInk: 'text-on-ink-muted' },
};

function Glyph({ status, animate }: { status: Status; animate: boolean }) {
  switch (status) {
    case 'published':
      return (
        <>
          <circle cx="6" cy="6" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle
            cx="6"
            cy="6"
            r="4.25"
            fill="currentColor"
            className={animate ? 'ff-publish-dot' : undefined}
          />
        </>
      );
    case 'changed':
      return (
        <>
          <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="2.5" fill="currentColor" />
        </>
      );
    case 'archived':
      return <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />;
    case 'expired':
      return (
        <circle
          cx="6"
          cy="6"
          r="4.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2.2 2"
        />
      );
    default:
      return <circle cx="6" cy="6" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />;
  }
}

export function StatusMark({
  status,
  label,
  onInk = false,
  animate = false,
  className,
}: {
  status: Status;
  /** Defaults to the status's standard label. Keep labels the same everywhere. */
  label?: string;
  onInk?: boolean;
  /** Fill the ring once on mount: the publish moment. Respects reduced motion. */
  animate?: boolean;
  className?: string;
}) {
  const { label: standard, tone, toneOnInk } = STATUSES[status];
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-label font-medium', className)}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        aria-hidden="true"
        className={cx('flex-none', onInk ? toneOnInk : tone)}
      >
        <Glyph status={status} animate={animate} />
      </svg>
      {label ?? standard}
    </span>
  );
}
