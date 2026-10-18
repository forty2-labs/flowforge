"use client";

import { cx } from "@flowforge/ui";
import { setTheme, THEME_LABELS, useTheme, type ThemeChoice } from "@/lib/theme";

const PREVIEW: Record<ThemeChoice, string> = {
  light: "bg-(--ff-swatch-light)",
  dark: "bg-(--ff-swatch-dark)",
  system: "bg-[linear-gradient(135deg,var(--ff-swatch-light)_50%,var(--ff-swatch-dark)_50%)]",
};

// A radio group: each choice shows a swatch of the ground it applies.
// Saved on this device only.
export function ThemeChoiceField() {
  const theme = useTheme();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-label font-medium">Theme</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(THEME_LABELS) as ThemeChoice[]).map((choice) => (
          <label
            key={choice}
            className={cx(
              "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-body",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ff-focus-ring)",
              theme === choice
                ? "border-primary bg-primary-soft text-on-primary-soft"
                : "border-line-strong bg-raised hover:bg-sunken",
            )}
          >
            <input
              type="radio"
              name="theme"
              value={choice}
              checked={theme === choice}
              onChange={() => setTheme(choice)}
              className="sr-only"
            />
            <span aria-hidden="true" className={cx("h-4 w-4 rounded-full border border-line-strong", PREVIEW[choice])} />
            {THEME_LABELS[choice]}
          </label>
        ))}
      </div>
      <p className="text-helper text-fg-muted">
        System follows your device. This choice is saved on this device only.
      </p>
    </fieldset>
  );
}
