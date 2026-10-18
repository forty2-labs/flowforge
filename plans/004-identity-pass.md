# Plan 004: Apply the sharpened identity

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> a STOP condition occurs, stop and report. When done, update this plan's row
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ac54c19..HEAD -- apps/web/src packages/ui/src`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (visual change to every screen)
- **Depends on**: plans/002-type-scale.md, plans/003-token-cleanup.md
- **Category**: direction
- **Planned at**: commit `ac54c19`, 2026-10-18

## Why this matters

The app looks like a template. Geist is the face `create-next-app` ships
with, and a cobalt-on-navy sidebar with white bordered cards is the most
common SaaS look. The owner asked for a web and mobile app that do not look
AI-generated. `docs/design.md` sets the direction: Schibsted Grotesk for the
interface, Newsreader for content, a paper ground, and the lifecycle dot as
the one signature element.

## Current state

- `apps/web/src/app/layout.tsx` loads `Geist`, `Geist_Mono` and `Newsreader`
  through `next/font/google` and puts their variables on `<html>`.
- `apps/web/src/app/globals.css` maps `--font-sans` to Geist.
- `tokens.css`: `--ff-bg-app: #f6f7f9`, `--ff-bg-sunken: #f1f3f6`,
  `--ff-border-default: #e3e5ea`, `--ff-border-strong: #c9ced8`.
- `apps/web/src/app/(auth)/layout.tsx` right-hand panel: a serif quote, then
  three chips joined by "→" ("One platform → Many workspaces → Many
  experiences"). `docs/design.md` bans arrow-joined chips.
- `apps/web/src/components/sidebar.tsx:52` all-caps, letter-spaced "Workspace"
  group label. Banned.
- Team page card titles use middle dots: `Members · 3`.
- Invitation rows show the role as a `Badge` and the expiry as text, with no
  status glyph.

## Scope

**In scope:** `apps/web/src/app/layout.tsx`, `apps/web/src/app/globals.css`,
`apps/web/src/app/(auth)/layout.tsx`, `packages/ui/src/tokens.css`,
`packages/ui/src/theme.ts`, `packages/ui/src/status-mark.tsx` (create),
`packages/ui/src/index.ts`, `apps/web/src/components/{sidebar,page-header,invitation-row}.tsx`,
`apps/web/src/app/w/[workspaceSlug]/{page,team/page}.tsx`.

**Out of scope:** the mobile layout of the sidebar (plan 008). API.

## Steps

### Step 1: Fonts

In `layout.tsx` replace `Geist` with `Schibsted_Grotesk` (variable
`--font-schibsted`, weights from the variable axis). Keep `Geist_Mono` and
`Newsreader`. In `globals.css` point `--font-sans` at `--font-schibsted`.

**Verify**: `npm run typecheck -w @flowforge/web` → exit 0.

### Step 2: Paper ground

In `tokens.css` and `theme.ts`: `bg-app #F4F4F1`, `bg-sunken #ECECE7`,
`border-default #E2E2DC`, `border-strong #C8C8C0`. Check that
`--ff-text-muted` (#5E6878) on `#ECECE7` is still at least 4.5:1.

### Step 3: StatusMark

Create `packages/ui/src/status-mark.tsx` exporting
`StatusMark({ status, label?, className? })`, where `status` is one of
`draft | published | changed | archived | pending | expired`. It renders an
inline-flex span: a 10 px SVG glyph (`aria-hidden`), then the label text
(default labels: Draft, Published, Unpublished changes, Archived, Pending,
Expired). Glyphs: empty ring, filled dot, dot inside a ring, short dash,
empty ring, dashed ring. Colours are from `docs/design.md`'s table, using
`currentColor` with token text classes. Export it from `index.ts`.

### Step 4: Apply

- Invitation rows: show `<StatusMark status="pending" label="Pending" />`
  before the expiry text.
- Sidebar group label: sentence case, `text-helper font-medium`, no
  uppercase and no letter spacing.
- Card titles: replace `Members · 3` with a title plus a separate count
  element (`<span className="text-fg-muted tabular-nums">3</span>`).
- Auth panel: remove the chip chain. Show a short typeset content sample in
  Newsreader (`text-article-title` headline, `text-article` paragraph) under
  a `StatusMark status="published"`, so the panel shows the product: content
  that looks like content, with its lifecycle mark. Keep `aria-hidden` on the
  panel.

**Verify**: `npm run lint && npm run typecheck` → exit 0;
`npm run test:visual -w @flowforge/web` → passes. Look at the 1440 px sign-up
and team screenshots.

## Done criteria

- [ ] `grep -rn "Geist\b\|Geist(" apps/web/src/app/layout.tsx` finds only `Geist_Mono`
- [ ] `grep -rn "uppercase" apps/web/src` → no matches
- [ ] `grep -rn "→" apps/web/src` → no matches
- [ ] `StatusMark` is exported from `@flowforge/ui`
- [ ] Lint, typecheck and the visual check pass

## STOP conditions

- `Schibsted_Grotesk` is not exported by `next/font/google` in the installed
  Next.js version.
- Muted text falls below 4.5:1 on the new grounds.

## Maintenance notes

Every content status in phase 2 (entries, pages) must render through
`StatusMark`. Do not add a second status style.
