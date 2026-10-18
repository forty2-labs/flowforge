# Plan 008: Make the workspace shell responsive

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> a STOP condition occurs, stop and report. When done, update this plan's row
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ac54c19..HEAD -- apps/web/src/components/sidebar.tsx "apps/web/src/app/w/[workspaceSlug]/layout.tsx"`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (navigation on every workspace screen)
- **Depends on**: plans/004-identity-pass.md, plans/007-switcher-menu.md
- **Category**: bug
- **Planned at**: commit `ac54c19`, 2026-10-18

## Why this matters

Below 768 px the whole sidebar (logo, switcher, nav, user block) stacks above
the page, pushing the content a full screen down. A café owner checking the
team from a phone sees chrome first. `docs/design.md` says: below 768 px the
sidebar becomes a top bar with a menu.

## Current state

- `apps/web/src/app/w/[workspaceSlug]/layout.tsx:10`:
  `flex min-h-screen flex-1 flex-col md:flex-row`, with the sidebar first.
- `apps/web/src/components/sidebar.tsx`: a server component that renders a
  `<nav>` with everything, `md:min-h-screen md:w-[var(--ff-sidebar-width)]`.
- `SidebarFallback` in the layout: `h-16` on mobile.

## Scope

**In scope:** `sidebar.tsx`, `apps/web/src/components/mobile-nav.tsx`
(create), `apps/web/src/app/w/[workspaceSlug]/layout.tsx`.

## Steps

### Step 1: Split the sidebar

Keep `Sidebar` as the desktop panel, hidden below `md`. Make it sticky
(`md:sticky md:top-0 md:h-screen`) so the user block stays visible on long
pages.

### Step 2: Mobile top bar

Create a client `MobileNav`, shown only below `md`: a 56 px ink bar with the
logo mark, the current workspace name, and a 44 × 44 menu button
(`aria-expanded`, `aria-controls`, label "Menu"). The button opens a
full-height drawer from the left on a native `<dialog>` (gives focus
handling and Esc), containing the switcher, the nav links and the user block.
The drawer closes on navigation (watch `usePathname`).

The server `Sidebar` passes its children to both so the data is fetched once.
Share the nav markup through a `SidebarContent` component.

**Verify**: `npm run test:visual -w @flowforge/web` → no sideways scroll at
390 px, and the 390 px screenshots show the page title within the first
120 px.

## Done criteria

- [ ] At 390 px the content starts under a 56 px bar
- [ ] The drawer opens and closes with the keyboard, and focus returns to the menu button
- [ ] Lint, typecheck and the visual check pass

## STOP conditions

- Splitting server and client parts forces `requireWorkspace` into a client
  component. It must stay on the server.

## Maintenance notes

The tablet rail (64 px) from the spec is deferred until there are more than
three nav items.
