import { cx } from "@flowforge/ui";
import type { BusinessId } from "./businesses";

// Drawn stand-ins for a business's photos: simple compositions in the
// sample-brand colours, three per business. Decorative; the image's name is
// given in words wherever one is chosen.

type Fills = { brand: string; soft: string; ground: string };

const FILLS: Record<BusinessId, Fills> = {
  cafe: { brand: "fill-sample-forest", soft: "fill-shape-teal", ground: "fill-sunken" },
  restaurant: { brand: "fill-sample-clay", soft: "fill-sunken", ground: "fill-raised" },
  retail: { brand: "fill-sample-ink", soft: "fill-line-strong", ground: "fill-sunken" },
};

function Composition({ index, fills }: { index: 0 | 1 | 2; fills: Fills }) {
  if (index === 0) {
    // A counter or kitchen: a long shape with objects standing on it.
    return (
      <>
        <rect x="0" y="118" width="320" height="62" className={fills.brand} />
        <rect x="40" y="70" width="38" height="48" rx="6" className={fills.soft} />
        <rect x="96" y="84" width="26" height="34" rx="4" className={fills.soft} />
        <circle cx="236" cy="92" r="26" className={fills.soft} />
        <rect x="150" y="30" width="120" height="8" rx="4" className={fills.soft} />
      </>
    );
  }
  if (index === 1) {
    // A close-up: one round form, centred.
    return (
      <>
        <circle cx="160" cy="96" r="70" className={fills.soft} />
        <circle cx="160" cy="96" r="44" className={fills.brand} />
        <path d="M136 96c10-18 38-18 48 0-10 12-38 12-48 0Z" className={fills.soft} />
      </>
    );
  }
  // Outside or a room: a horizon and a few forms in front of it.
  return (
    <>
      <rect x="0" y="0" width="320" height="104" className={fills.soft} />
      <path d="M0 104 C 80 84, 180 124, 320 96 V180 H0 Z" className={fills.brand} />
      <rect x="64" y="122" width="56" height="30" rx="4" className={fills.soft} />
      <rect x="196" y="116" width="56" height="36" rx="4" className={fills.soft} />
    </>
  );
}

export function FeaturedImage({
  business,
  index,
  className,
}: {
  business: BusinessId;
  index: 0 | 1 | 2;
  className?: string;
}) {
  const fills = FILLS[business];
  return (
    <svg aria-hidden="true" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className={cx("block", className)}>
      <rect width="320" height="180" className={fills.ground} />
      <Composition index={index} fills={fills} />
    </svg>
  );
}
