import { cx } from "@flowforge/ui";

// The note on anything shown here that is not built yet.
export const COMING = "Coming in the next release";

// The heading every home section opens with, so they all match: an optional
// sentence-case eyebrow, the h2 (its id is `${id}-title`, for the section's
// aria-labelledby) and a short intro.
export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "start",
  className,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div className={cx("flex max-w-2xl flex-col gap-4", align === "center" && "mx-auto items-center text-center", className)}>
      {eyebrow && <p className="text-label font-medium text-fg-secondary">{eyebrow}</p>}
      <h2 id={`${id}-title`} className="text-page text-fg sm:text-display">
        {title}
      </h2>
      {intro && <p className="text-section font-normal text-fg-secondary">{intro}</p>}
    </div>
  );
}
