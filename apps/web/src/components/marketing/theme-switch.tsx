"use client";

import { setTheme, THEME_LABELS, useTheme, type ThemeChoice } from "@/lib/theme";

const NEXT: Record<ThemeChoice, ThemeChoice> = {
  light: "dark",
  dark: "system",
  system: "light",
};

// One button that steps through Light, Dark and System. Its name says the
// current choice; the choice is saved on this device, as in Settings.
export function ThemeSwitch() {
  const theme = useTheme();
  return (
    <button
      type="button"
      aria-label={`Theme: ${THEME_LABELS[theme]}`}
      title={`Theme: ${THEME_LABELS[theme]}. Change to ${THEME_LABELS[NEXT[theme]]}`}
      onClick={() => setTheme(NEXT[theme])}
      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-md text-fg-secondary transition-colors duration-[120ms] hover:bg-glass-hover hover:text-fg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {theme === "light" && (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
          </>
        )}
        {theme === "dark" && <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />}
        {theme === "system" && (
          <>
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8M12 16v4" />
          </>
        )}
      </svg>
    </button>
  );
}
