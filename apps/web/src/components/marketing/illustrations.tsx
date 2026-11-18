// Drawings for the public site, made from the product's own marks: the
// draft ring and published dot, and the outlines of a browser and a phone.
// Colours come from tokens, so they follow the theme. All are decorative.

import { BrowserFrame, cx, FlowField, LogoMark, PhoneFrame, Tilt } from "@flowforge/ui";

// Irregular shapes behind the hero: soft cobalt and teal forms that give
// the editor stage somewhere to sit, with one fine outline offset from the
// large form like a misregistered print. Texture only: they carry no meaning
// and follow the theme through their tokens.
export function HeroShapes({ className }: { className?: string }) {
  const large =
    "M760 330 C 905 262, 1135 268, 1262 382 C 1392 498, 1404 690, 1318 822 C 1236 948, 1062 974, 930 1048 C 790 1126, 610 1102, 548 978 C 486 854, 570 760, 556 640 C 542 520, 612 400, 760 330 Z";
  return (
    <svg
      data-testid="hero-shapes"
      aria-hidden="true"
      viewBox="0 0 1440 1200"
      preserveAspectRatio="xMidYMax slice"
      className={className}
    >
      <path d={large} className="fill-shape-cobalt" />
      <path
        d="M118 812 C 214 700, 410 690, 506 790 C 604 892, 588 1052, 470 1120 C 352 1188, 168 1170, 96 1072 C 26 978, 40 902, 118 812 Z"
        className="fill-shape-teal"
      />
      <path d={large} transform="translate(-34 -26)" fill="none" className="stroke-line-strong" strokeWidth="1.25" />
    </svg>
  );
}

// The hero visual: a website and a phone, joined to Flowforge (the hub in
// the middle) by lanes of flowing content. Draft rings leave the hub and
// arrive as published dots. The screens are simple sketches of one café
// page; the whole visual tilts gently with the pointer.
export function HeroFlow({ className }: { className?: string }) {
  return (
    <Tilt
      data-testid="hero-tilt"
      max={4}
      aria-hidden="true"
      className={cx(
        "relative grid grid-cols-[minmax(0,1fr)_1.25rem_auto_1.25rem_auto] items-center py-6 sm:grid-cols-[minmax(0,1fr)_minmax(1rem,4rem)_auto_minmax(1rem,4rem)_auto]",
        className,
      )}
    >
      <FlowField />
      <div data-flow="target" className="relative min-w-0 [transform:translateZ(24px)]">
        <BrowserFrame address="harbourcafe.flowforge.site" className="shadow-dialog">
          <div className="flex flex-col gap-3 px-4 py-5 sm:px-6 sm:py-7">
            <span className="text-label font-medium text-fg">Harbour Café</span>
            <span className="h-1 w-10 rounded-full bg-sample-forest" />
            <p className="font-serif text-section text-fg sm:text-article-title">Spring menu, now serving</p>
            <span className="h-2 w-full rounded-full bg-sunken" />
            <span className="h-2 w-4/5 rounded-full bg-sunken" />
            <span className="mt-1 h-8 w-24 rounded-full bg-sample-forest" />
          </div>
        </BrowserFrame>
      </div>
      <div
        data-flow="source"
        className="relative col-start-3 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface shadow-dialog [transform:translateZ(40px)] sm:h-16 sm:w-16"
      >
        <LogoMark size={28} />
      </div>
      <div data-flow="target" className="relative col-start-5 [transform:translateZ(32px)]">
        <PhoneFrame className="w-24 shadow-dialog sm:w-36" screenClassName="min-h-44 sm:min-h-64">
          <div className="flex flex-col gap-2 px-2.5 py-3 sm:gap-3 sm:px-3">
            <span className="text-helper font-medium text-fg">Harbour Café</span>
            <span className="h-1 w-6 rounded-full bg-sample-forest" />
            <p className="font-serif text-label text-fg sm:text-title">Spring menu, now serving</p>
            <span className="h-1.5 w-full rounded-full bg-sunken" />
            <span className="h-1.5 w-3/4 rounded-full bg-sunken" />
          </div>
          <span className="mx-2.5 mt-auto mb-1 h-7 rounded-full bg-sample-forest sm:mx-3" />
        </PhoneFrame>
      </div>
    </Tilt>
  );
}

const STEP = "h-24 w-auto text-line-strong";

// Describe your content: a content type as a list of fields.
export function ModelIllustration() {
  return (
    <svg viewBox="0 0 160 96" fill="none" aria-hidden="true" className={STEP}>
      {[12, 40, 68].map((y, index) => (
        <g key={y}>
          <rect x="1" y={y} width="44" height="16" rx="4" className="fill-sunken" />
          <rect x="8" y={y + 6} width={[22, 26, 18][index]} height="4" rx="2" className="fill-fg-secondary" />
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
      <path d="M74 69v10" className="stroke-fg" strokeWidth="1.5" />
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
