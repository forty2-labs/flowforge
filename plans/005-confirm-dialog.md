# Plan 005: Add ConfirmDialog and confirm destructive actions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> a STOP condition occurs, stop and report. When done, update this plan's row
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ac54c19..HEAD -- packages/ui/src apps/web/src/components/member-row.tsx apps/web/src/components/invitation-row.tsx`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (changes how removal is triggered)
- **Depends on**: plans/003-token-cleanup.md (uses `shadow-dialog`)
- **Category**: bug
- **Planned at**: commit `ac54c19`, 2026-10-18

## Why this matters

Removing a member uses `window.confirm`, an unstyled browser dialog that
can't name the action on its button. Revoking an invitation has no
confirmation at all, so one mis-click kills a link the invitee may already
have. The design spec defines a confirmation dialog where focus starts on
the least destructive control, focus is trapped, and Esc closes it.

## Current state

- `apps/web/src/components/member-row.tsx:33-41`: `confirmRemove` builds a
  question and calls `window.confirm(question)`.
- `apps/web/src/components/invitation-row.tsx:45-55`: the Revoke button
  calls `revokeInvitation` directly.
- `Button` in `packages/ui/src/button.tsx` has `danger` and `secondary`
  variants.

## Scope

**In scope:** `packages/ui/src/confirm-dialog.tsx` (create),
`packages/ui/src/index.ts`, `member-row.tsx`, `invitation-row.tsx`,
`apps/web/src/app/globals.css` (backdrop style).

**Out of scope:** the server actions in `apps/web/src/lib/actions/team.ts`.

## Steps

### Step 1: Build ConfirmDialog

A client component on the native `<dialog>` element, opened with
`showModal()`, which gives a focus trap, Esc to close, and inert background
for free. Props: `open`, `title`, `children` (the consequence, in plain
words), `confirmLabel` (a verb such as "Remove member"), `onConfirm`,
`onClose`, `pending`. Layout: `rounded-xl bg-surface shadow-dialog`, max width
440 px, padding 24 px, title in `text-section`, buttons right-aligned with
Cancel (`secondary`) first. Give Cancel `autoFocus`. Use `aria-labelledby` to
point at the title. The backdrop is ink at 40% opacity. Under reduced motion,
no transform.

### Step 2: Use it

- Member row: "Remove {name}?" / "Leave {workspace}?" with the consequence
  "They'll lose access immediately." and a `danger` confirm ("Remove member" /
  "Leave workspace").
- Invitation row: "Revoke the invitation to {email}?" / "The link stops
  working. You can invite them again later." / "Revoke invitation".

**Verify**: `grep -rn "window.confirm" apps/web/src` → no matches; lint and
typecheck exit 0.

## Done criteria

- [ ] No `window.confirm` remains
- [ ] Opening the dialog puts focus on Cancel; Esc closes it and returns focus to the trigger
- [ ] Lint, typecheck and the visual check pass

## STOP conditions

- `<dialog>` `showModal` behaves differently in the target browsers than
  described. Report; do not add a dialog library.

## Maintenance notes

Every destructive action uses `ConfirmDialog`. Typed-name confirmation is
reserved for irreversible actions such as deleting a workspace.
