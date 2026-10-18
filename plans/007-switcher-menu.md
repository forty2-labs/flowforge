# Plan 007: Make the workspace switcher an accessible menu

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> a STOP condition occurs, stop and report. When done, update this plan's row
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ac54c19..HEAD -- apps/web/src/components/workspace-switcher.tsx`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `ac54c19`, 2026-10-18

## Why this matters

Keyboard and screen reader users can open the switcher but not use it well.
Focus stays on the button, arrow keys do nothing, Esc closes the list
without returning focus, and `aria-controls` points at an element that
doesn't exist while the list is closed. This is the main way to move
between businesses.

## Current state

`apps/web/src/components/workspace-switcher.tsx`:
- line 46-50: the trigger has `aria-expanded` and
  `aria-controls="workspace-switcher-list"`.
- line 75: the list renders only when `open`.
- lines 22-38: a document listener closes on outside mousedown or Escape.
- Items are `<Link>`s in a `<ul>`; the last item is "Create workspace".

## Scope

**In scope:** `apps/web/src/components/workspace-switcher.tsx`.

## Steps

### Step 1: Disclosure navigation pattern

Keep links (they navigate), following the ARIA Authoring Practices
"disclosure navigation" pattern rather than `role="menu"`:
- Set `aria-controls` only while open.
- On open, focus the current workspace's link.
- ArrowDown and ArrowUp move focus between the links (wrapping); Home and
  End jump to the first and last.
- Esc closes and returns focus to the trigger. Tab out of the list closes it
  (`onBlur` with `relatedTarget` outside the container).
- Outside click closes it, as now.

**Verify**: `npm run lint && npm run typecheck` → exit 0.

## Done criteria

- [ ] With the keyboard only: Tab to the switcher, Enter opens it, arrows move, Esc closes and focus is back on the button
- [ ] Lint and typecheck pass

## STOP conditions

- The switcher is moved into a different component by another plan before
  this runs. Re-read and adapt the line references.

## Maintenance notes

Plan 008 places this component in a mobile drawer too. Keep it free of
layout assumptions.
