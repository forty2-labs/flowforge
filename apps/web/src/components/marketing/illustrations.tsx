import { cx } from "@flowforge/ui";

// Drawings for the public site, made from the product's own marks: page
// proofs with crop marks, the draft ring and published dot, and the outlines
// of a browser and a phone. Colours come from tokens, so they follow the
// theme. All are decorative.

function CropMarks({ className }: { className?: string }) {
  const corner = "absolute h-3 w-3 border-line-strong";
  return (
    <span aria-hidden="true" className={className}>
      <span className={`${corner} top-0 left-0 border-t border-l`} />
      <span className={`${corner} top-0 right-0 border-t border-r`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} right-0 bottom-0 border-r border-b`} />
    </span>
  );
}

// One entry, set as a proof, and the two places it appears. The text is
// real type, not a picture of type, so it renders in Newsreader.
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cx("relative grid gap-5 sm:grid-cols-[1fr_auto]", className)}>
      <div className="relative px-6 py-7">
        <CropMarks />
        <div className="flex items-center gap-2 text-helper text-success">
          <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.25" fill="currentColor" /></svg>
          <span>Published</span>
        </div>
        <p className="mt-4 font-serif text-article-title text-fg">Spring menu, now serving</p>
        <p className="mt-3 max-w-80 font-serif text-article text-fg-secondary">
          Wild garlic soup, rhubarb tart and the first asparagus from Hollow Farm.
        </p>
      </div>
      <div className="flex items-end gap-4 sm:flex-col sm:items-start sm:justify-center">
        <MiniBrowser />
        <MiniPhone />
      </div>
    </div>
  );
}

function MiniBrowser() {
  return (
    <svg width="168" height="112" viewBox="0 0 168 112" fill="none" className="text-line-strong">
      <rect x="0.75" y="0.75" width="166.5" height="110.5" rx="8" className="fill-surface" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 18h166" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="9.5" r="2.5" className="fill-line-strong" />
      <circle cx="18" cy="9.5" r="2.5" className="fill-line-strong" />
      <rect x="14" y="32" width="96" height="9" rx="2" className="fill-fg" />
      <rect x="14" y="50" width="136" height="5" rx="2" className="fill-line-strong" />
      <rect x="14" y="61" width="120" height="5" rx="2" className="fill-line-strong" />
      <rect x="14" y="80" width="64" height="18" rx="4" className="fill-primary" />
    </svg>
  );
}

function MiniPhone() {
  return (
    <svg width="64" height="112" viewBox="0 0 64 112" fill="none" className="text-line-strong">
      <rect x="0.75" y="0.75" width="62.5" height="110.5" rx="12" className="fill-surface" stroke="currentColor" strokeWidth="1.5" />
      <rect x="24" y="6" width="16" height="4" rx="2" className="fill-line-strong" />
      <rect x="8" y="22" width="40" height="7" rx="2" className="fill-fg" />
      <rect x="8" y="36" width="48" height="4" rx="2" className="fill-line-strong" />
      <rect x="8" y="45" width="42" height="4" rx="2" className="fill-line-strong" />
      <rect x="8" y="88" width="48" height="14" rx="4" className="fill-primary" />
    </svg>
  );
}

const STEP = "h-24 w-auto text-line-strong";

// Describe your content: a content type as a list of fields.
export function ModelIllustration() {
  return (
    <svg viewBox="0 0 160 96" fill="none" aria-hidden="true" className={STEP}>
      {[12, 40, 68].map((y, index) => (
        <g key={y}>
          <rect x="1" y={y} width="44" height="16" rx="4" className="fill-primary-soft" />
          <rect x="8" y={y + 6} width={[22, 26, 18][index]} height="4" rx="2" className="fill-primary" />
          <rect x="54" y={y} width="104" height="16" rx="4" className="fill-surface" stroke="currentColor" strokeWidth="1.25" />
        </g>
      ))}
    </svg>
  );
}

// Write it once: an entry being typed, with a draft ring.
export function WriteIllustration() {
  return (
    <svg viewBox="0 0 160 96" fill="none" aria-hidden="true" className={STEP}>
      <rect x="1" y="1" width="158" height="94" rx="8" className="fill-surface" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="16" cy="18" r="4.25" className="stroke-fg-muted" strokeWidth="1.5" />
      <rect x="14" y="34" width="92" height="8" rx="2" className="fill-fg" />
      <rect x="14" y="52" width="128" height="4" rx="2" className="fill-line-strong" />
      <rect x="14" y="62" width="110" height="4" rx="2" className="fill-line-strong" />
      <rect x="14" y="72" width="56" height="4" rx="2" className="fill-line-strong" />
      <path d="M74 69v10" className="stroke-primary" strokeWidth="1.5" />
    </svg>
  );
}

// Publish everywhere: the filled dot, and the two places it reaches.
export function PublishIllustration() {
  return (
    <svg viewBox="0 0 160 96" fill="none" aria-hidden="true" className={STEP}>
      <circle cx="22" cy="48" r="8" className="fill-success" />
      <path d="M34 44c22-18 40-24 58-24M34 52c22 18 40 24 58 24" className="stroke-line-strong" strokeWidth="1.25" strokeDasharray="3 3" />
      <rect x="96" y="6" width="62" height="40" rx="5" className="fill-surface" stroke="currentColor" strokeWidth="1.25" />
      <path d="M96 14h62" stroke="currentColor" strokeWidth="1.25" />
      <rect x="104" y="22" width="34" height="5" rx="2" className="fill-fg" />
      <rect x="104" y="32" width="46" height="3" rx="1.5" className="fill-line-strong" />
      <rect x="108" y="56" width="26" height="38" rx="6" className="fill-surface" stroke="currentColor" strokeWidth="1.25" />
      <rect x="113" y="66" width="14" height="4" rx="2" className="fill-fg" />
      <rect x="113" y="74" width="16" height="2.5" rx="1.25" className="fill-line-strong" />
    </svg>
  );
}
