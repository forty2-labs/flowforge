"use client";

import type { SessionDto } from "@flowforge/types";
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flowforge/ui";
import { signOut } from "@/lib/actions/auth";
import { setTheme, THEME_LABELS, useTheme, type ThemeChoice } from "@/lib/theme";

// The person's own controls: theme on this device, and signing out.
export function AccountMenu({
  user,
  inline = false,
}: {
  user: SessionDto["user"];
  /** Inside the phone drawer the menu must render in place (see DropdownMenuContent). */
  inline?: boolean;
}) {
  const theme = useTheme();
  return (
    // Non-modal: Radix's modal mode hides the page from screen readers while
    // leaving it focusable. Focus still moves in, and Esc or a click outside closes it.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={`Account: ${user.name}`}
        className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left hover:bg-glass-hover data-[state=open]:bg-glass-hover"
      >
        <Avatar name={user.name} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-label font-medium text-fg">{user.name}</span>
          <span className="truncate text-helper text-fg-muted">{user.email}</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-fg-muted" aria-hidden="true">
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent inline={inline} side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as ThemeChoice)}>
          {(Object.keys(THEME_LABELS) as ThemeChoice[]).map((choice) => (
            <DropdownMenuRadioItem key={choice} value={choice}>
              {THEME_LABELS[choice]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
