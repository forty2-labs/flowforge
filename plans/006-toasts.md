# Plan 006: Add toasts and copy-link feedback

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> a STOP condition occurs, stop and report. When done, update this plan's row
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ac54c19..HEAD -- packages/ui/src apps/web/src/components apps/web/src/app/layout.tsx`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/003-token-cleanup.md
- **Category**: bug
- **Planned at**: commit `ac54c19`, 2026-10-18

## Why this matters

Changing a member's role saves silently, so people can't tell it worked.
Copying an invitation link shows "Copied" forever and ignores clipboard
failures (permission denied, insecure context). The spec defines toasts:
bottom-left on web, 6 seconds, paused on hover or focus, errors kept until
dismissed, announced through a live region.

## Current state

- `apps/web/src/components/member-row.tsx:26-32` `run()` sets only `error`.
- `apps/web/src/components/invite-link.tsx:20-27`: `navigator.clipboard.writeText(url)`
  with no try/catch; `setCopied(true)` is never reset.
- `apps/web/src/components/invitation-row.tsx`: revoke success removes the
  row on revalidation with no message.

## Scope

**In scope:** `packages/ui/src/toast.tsx` (create), `packages/ui/src/index.ts`,
`apps/web/src/app/layout.tsx` (mount provider), `member-row.tsx`,
`invitation-row.tsx`, `invite-link.tsx`.

**Out of scope:** server actions.

## Steps

### Step 1: Toast provider

`ToastProvider` plus a `useToast()` hook returning `toast({ message, tone })`,
where tone is `success`, `error` or `info`. It renders a fixed region at the
bottom-left (bottom-centre under 768 px) with `role="status"` and
`aria-live="polite"`; error toasts use `role="alert"`. It auto-dismisses
non-errors after 6 s, pauses while hovered or focused, and every toast has a
dismiss button. Styles: `bg-ink text-white rounded-lg shadow-menu`. Enter
over `--ff-motion-base`, fade only under reduced motion. Mount it in the root
layout.

### Step 2: Use it

- Role change success: "{name} is now {Role}."
- Member removed: "{name} was removed." Leaving redirects, so no toast.
- Invitation revoked: "Invitation to {email} revoked."
- New link: "New link ready for {email}."
- Copy link: wrap in try/catch. On success show "Copied" on the button for
  2 s, then reset. On failure show the error toast "Couldn't copy. Select the
  link and copy it yourself."

## Done criteria

- [ ] Every mutation on the Team screen ends in a visible result
- [ ] `grep -n "catch" apps/web/src/components/invite-link.tsx` finds the clipboard handler
- [ ] Lint, typecheck and the visual check pass

## STOP conditions

- The root layout cannot host a client provider without breaking
  `cacheComponents` prerendering. Report the build error.

## Maintenance notes

Toast text uses the same verb as the button that caused it. Do not toast on
navigation.
