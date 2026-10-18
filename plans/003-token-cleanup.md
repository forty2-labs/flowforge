# Plan 003: Move hard-coded colours onto tokens and sync theme.ts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> a STOP condition occurs, stop and report. When done, update this plan's row
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ac54c19..HEAD -- packages/ui/src apps/web/src/components`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `ac54c19`, 2026-10-18

## Why this matters

Components carry their own hex values, which bypass the tokens. A theme
change or dark mode would miss them, and `docs/decisions.md` says the tokens
exist so themes can be added "without renaming anything". `theme.ts` is
also missing four tokens, and the future mobile app will read its colours
from that file.

## Current state

Hex values in components (outside `tokens.css` and `theme.ts`):

- `apps/web/src/components/sidebar.tsx:52` `text-[#6F7A8F]` (nav group label)
- `apps/web/src/components/sidebar.tsx:63` `bg-[#1E2A44]` (divider)
- `apps/web/src/components/nav-link.tsx:36` `stroke={active ? "#A9B6FF" : "#8B95A8"}`
- `apps/web/src/components/workspace-switcher.tsx:62` `stroke="#8B95A8"`
- `apps/web/src/components/invite-link.tsx:11` `text-[#1C6A41]`
- `packages/ui/src/alert.tsx:7-10` `text-[#5C130C]`, `text-[#8A4A00]`, `text-[#17508F]`, `text-[#1C6A41]`
- `packages/ui/src/logo.tsx` brand mark fills. These stay: the logo is artwork.

`theme.ts` lacks `bgSidebar`, `bgSidebarRaised`, `borderOnInk` and
`textOnInkMuted`, which `tokens.css` defines.

There are no elevation tokens. `workspace-switcher.tsx` uses Tailwind's
`shadow-lg`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |

## Scope

**In scope:** `packages/ui/src/{tokens.css,tailwind.css,theme.ts,alert.tsx}`,
`apps/web/src/components/{sidebar,nav-link,workspace-switcher,invite-link}.tsx`.

**Out of scope:** `logo.tsx` artwork. Palette value changes (plan 004).

## Steps

### Step 1: Add the missing tokens

Add to `tokens.css`, `tailwind.css` and `theme.ts`:
- `--ff-text-on-ink-subtle` (#6F7A8F), `--ff-icon-on-ink` (#8B95A8),
  `--ff-icon-on-ink-active` (#A9B6FF), `--ff-border-on-ink-subtle` (#1E2A44);
- strong text for each status: `--ff-success-strong` (#1C6A41),
  `--ff-warning-strong` (#8A4A00), `--ff-error-strong` (#5C130C),
  `--ff-info-strong` (#17508F);
- elevation: `--ff-shadow-menu` `0 8px 24px -6px rgb(14 23 38 / 0.18), 0 0 0 1px rgb(14 23 38 / 0.06)`
  and `--ff-shadow-dialog` `0 24px 64px -12px rgb(14 23 38 / 0.32)`, mapped as
  `--shadow-menu` and `--shadow-dialog`.

Add the four missing entries to `theme.ts`.

### Step 2: Use them

Replace each hex value listed above with the matching class (`text-on-ink-subtle`,
`bg-line-on-ink-subtle`, `text-success-strong`…). For SVG strokes use
`stroke="currentColor"` with a text colour class. Replace `shadow-lg` with
`shadow-menu`.

**Verify**: `grep -rnE '#[0-9A-Fa-f]{6}' apps/web/src packages/ui/src | grep -v -e tokens.css -e theme.ts -e logo.tsx` → no matches.

## Done criteria

- [ ] The grep above returns nothing
- [ ] Every `--ff-*` variable in `tokens.css` has an entry in `theme.ts`
- [ ] `npm run lint` and `npm run typecheck` exit 0

## STOP conditions

- A colour does not match an existing or listed token and is not artwork.

## Maintenance notes

A component that needs a new colour adds a semantic token, never a hex value.
