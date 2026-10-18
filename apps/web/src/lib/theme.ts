"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./theme-script";

export type ThemeChoice = "light" | "dark" | "system";

export const THEME_LABELS: Record<ThemeChoice, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const CHANGE_EVENT = "ff-theme-change";

function read(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribe(onChange: () => void): () => void {
  // Other controls on this page, and other tabs, stay in step.
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  try {
    if (choice === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Storage can be blocked; the choice still applies to this page.
  }
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// The person's choice on this device. The server cannot know it, so the
// first render assumes System and corrects itself after hydration.
export function useTheme(): ThemeChoice {
  return useSyncExternalStore(subscribe, read, () => "system");
}
