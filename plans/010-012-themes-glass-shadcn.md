# Plans 010–012: Themes, translucent glass and shadcn

> Status: DONE on branch `FLO-47`. Recorded here so later work can follow the
> same approach. Planned at commit `5189fa8`, 2026-10-18.

## Why this matters

The owner asked for a translucent look across the product, including the
admin screens, with light, dark and system themes, and for shadcn components
integrated with Tailwind. The rules are in `docs/design.md` (Themes, Glass,
Components and shadcn) and the reasons in `docs/decisions.md`.

## What was done

### 010 Themes
- `packages/ui/src/tokens.css`: light values on `:root`; dark values for
  `:root[data-theme="dark"]` and, under `prefers-color-scheme: dark`, for
  `:root:not([data-theme="light"])`. The two dark blocks must stay identical.
- `apps/web/src/lib/theme-script.ts`: a `<head>` script applies a saved choice
  before first paint. `apps/web/src/lib/theme.ts`: `useTheme` and `setTheme`.
- Theme choice in the account menu (`components/account-menu.tsx`) and in
  Settings › Appearance (`components/theme-choice.tsx`).
- `theme.ts` exports `color.light` and `color.dark` with the same keys.

### 011 Glass
- `packages/ui/src/glass.css`: `glass`, `glass-strong` and `ground` utilities
  with solid fallbacks for no blur support, reduced transparency and more
  contrast.
- Glass sidebar (floating, inset 12 px), phone top bar and drawer, section
  panels, overview tiles, dialogs, toasts and menus. Inputs stay solid.
- Highlight colour (`bg-highlight`) on section count pills.
- Overview became stat tiles with `text-stat` figures.

### 012 shadcn
- `packages/ui/components.json`; exports `./lib/*` and `./components/*`.
- `src/lib/utils.ts`: `cn` with `tailwind-merge` taught our type and shadow
  names. `cx` re-exports it.
- shadcn colour names aliased to our tokens in `tailwind.css`.
- First component: `src/components/dropdown-menu.tsx`, restyled.

## Verification

| Purpose | Command | Expected |
|---|---|---|
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |
| Visual and accessibility | `npm run test:visual -w @flowforge/web` | 4 passed (390 and 1440 px, light and dark) |

## Maintenance notes

- A new colour token needs light and dark values and a contrast check
  against the blended glass in both themes.
- A new type size goes into `tokens.css`, `tailwind.css`, `theme.ts` and the
  `tailwind-merge` list, and must not share a name with a colour alias.
- Components added with `npx shadcn add` must be restyled before use.
- Radix content inside the phone drawer must render `inline`.
