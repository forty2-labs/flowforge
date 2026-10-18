# Plan 009: Replace "Loading…" with skeletons

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> a STOP condition occurs, stop and report. When done, update this plan's row
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ac54c19..HEAD -- "apps/web/src/app/w/[workspaceSlug]" packages/ui/src`

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/003-token-cleanup.md
- **Category**: bug
- **Planned at**: commit `ac54c19`, 2026-10-18

## Why this matters

Every workspace section shows a bare "Loading…" line, then the layout jumps
into place. The spec calls for skeletons shaped like the final layout, shown
only after 300 ms (so fast loads don't flash), with `aria-busy` on the
container.

## Current state

- `apps/web/src/app/w/[workspaceSlug]/loading.tsx` returns
  `<p className="text-sm text-fg-muted">Loading…</p>`.
- `team/loading.tsx` and `settings/loading.tsx` re-export it
  (`export { default } from "../loading";`). `AGENTS.md` requires each new
  section to keep doing this.
- `apps/web/src/app/invite/[token]/page.tsx` has a "Loading invitation…"
  Suspense fallback.

## Scope

**In scope:** `packages/ui/src/skeleton.tsx` (create), `index.ts`, the shared
`loading.tsx`, the invitation fallback, `globals.css` (delay keyframe).

## Steps

### Step 1: Skeleton primitive

`Skeleton({ className })` renders an `aria-hidden` block with
`bg-sunken rounded-md`. Add a `.ff-delayed` utility that starts at opacity 0
and fades in after 300 ms (`animation-delay`). It shows immediately, without
the fade, under reduced motion.

### Step 2: Use it

The shared `loading.tsx` renders a page-title bar plus one panel with three
rows (avatar circle plus two lines). Wrap it in a container with `aria-busy`
and a visually hidden "Loading" for screen readers. Give the invitation
fallback the same treatment.

## Done criteria

- [ ] `grep -rn "Loading…" apps/web/src` → no matches
- [ ] Lint, typecheck and the visual check pass

## STOP conditions

- None specific.

## Maintenance notes

New sections may export their own skeleton shaped like their content instead
of re-exporting the shared one.
