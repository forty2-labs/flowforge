# Plan 002: Replace hand-typed font sizes with a type scale

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> a STOP condition occurs, stop and report. When done, update this plan's row
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ac54c19..HEAD -- packages/ui/src apps/web/src`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `ac54c19`, 2026-10-18

## Why this matters

Font sizes are typed by hand in each component: 33 uses across 10 values
(`text-[13px]` ×10, `text-[13.5px]` ×7, `text-[15px]` ×6, `text-[28px]` ×4,
and others). The design system defines a type scale, but nothing in code
enforces it, so each new screen drifts further. Named sizes make the scale the
easy path and let one change restyle every page title.

## Current state

- `packages/ui/src/tailwind.css` maps colour and radius tokens in an
  `@theme inline { ... }` block. There are no font size tokens.
- `apps/web/src/app/globals.css` sets `--font-sans`, `--font-mono` and
  `--font-serif` in its own `@theme inline` block.
- Example uses: `apps/web/src/components/page-header.tsx:13`
  `text-[28px] leading-9 font-semibold tracking-[-0.015em]`;
  `packages/ui/src/text-field.tsx:30` `text-[13px] font-medium`.
- Find them all: `grep -rnE 'text-\[[0-9.]+px\]' apps/web/src packages/ui/src`.

The target scale, from `docs/design.md`:

| Token | Size / line | Weight | Tracking |
|---|---|---|---|
| display | 40 / 48 | 600 | -0.025em |
| page | 28 / 36 | 600 | -0.015em |
| section | 18 / 26 | 600 | -0.005em |
| title | 15 / 22 | 600 | 0 |
| body | 14 / 20 | 400 | 0 |
| label | 13 / 18 | 500 | 0 |
| helper | 12 / 16 | 400 | 0 |
| article | 19 / 32 | 400 | 0 (Newsreader) |
| article-title | 26 / 34 | 600 | -0.01em (Newsreader) |

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |
| Visual | `npm run test:visual -w @flowforge/web` | passes, screenshots updated |

## Scope

**In scope:** `packages/ui/src/tokens.css`, `packages/ui/src/tailwind.css`,
`packages/ui/src/theme.ts`, every `.tsx` in `packages/ui/src` and
`apps/web/src` that uses `text-[Npx]`.

**Out of scope:** colours, fonts (plan 004), layout.

## Steps

### Step 1: Add the tokens

In `tokens.css` add `--ff-text-<name>-size`, `-line` and, where non-zero,
`-tracking` for each row above. In `tailwind.css` map each as Tailwind v4 text
utilities inside `@theme inline`:
`--text-page: var(--ff-text-page-size); --text-page--line-height: var(--ff-text-page-line); --text-page--letter-spacing: ...; --text-page--font-weight: 600;`.
Add `typography` to `theme.ts` with the same numbers.

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Replace the hand-typed sizes

Map each use to the nearest token, and drop the `leading-*`, `tracking-*` and
`font-*` classes the token now supplies: 28 px → `text-page`, 22 px and 17 px
→ `text-section`, 15 px → `text-title` (or `text-body` for body copy),
14.5 px and 14 px → `text-body`, 13.5 px and 13 px → `text-label` (or
`text-body` for paragraphs), 12.5 px and 12 px → `text-helper`, 11 px →
`text-helper`. The 34 px auth-panel quote becomes `text-article-title`.

**Verify**: `grep -rnE 'text-\[[0-9.]+px\]' apps/web/src packages/ui/src` → no matches.

## Done criteria

- [ ] The grep above returns nothing
- [ ] `npm run lint` and `npm run typecheck` exit 0
- [ ] Screenshots show no clipped text at 390 px

## STOP conditions

- Tailwind does not generate the `text-page` utility (check the computed font
  size in the browser). Do not fall back to arbitrary values.

## Maintenance notes

New text uses a named size. A new size is a design decision: add it to
`docs/design.md` and all three token files.
