# Plan 001: Add a visual and accessibility check for the web app

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ac54c19..HEAD -- apps/web/package.json apps/web/playwright.config.ts apps/web/e2e .gitignore`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `ac54c19`, 2026-10-18

## Why this matters

The web app has no tests. CI only lints, typechecks and builds it, so a change
that breaks a layout at phone width, hides focus, or drops contrast below
WCAG AA passes CI. Every later UI plan needs a one-command way to see the
screens and catch accessibility regressions. This plan adds a Playwright
script that walks the real app, saves screenshots at 390 px and 1440 px, and
fails on serious axe violations or sideways scrolling.

## Current state

- `apps/web/package.json` scripts: `dev`, `build`, `start`, `lint`,
  `typecheck`. No test runner.
- Screens to cover (all under `apps/web/src/app`): `/signin`, `/signup`,
  `/workspaces/new`, `/w/[slug]` (overview), `/w/[slug]/team`,
  `/w/[slug]/settings`, `/invite/[token]`.
- Signed-in screens need the API (port 4000) and Postgres. `npm run dev` at
  the repo root starts the API and web app; `npm run db:up` starts Postgres in
  Docker.
- An invitation link is shown to the inviter on the Team screen inside a
  `<code>` element after submitting the invite form
  (`apps/web/src/components/invite-link.tsx`).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Start DB | `npm run db:up` | containers running |
| Migrate | `npm run db:deploy -w @flowforge/api` | "All migrations have been successfully applied" or "No pending migrations" |
| Run app | `npm run dev` | web on :3000, API on :4000 |
| Visual check | `npm run test:visual -w @flowforge/web` | all tests pass |
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |

## Scope

**In scope:**
- `apps/web/package.json` (dev dependencies and `test:visual` script)
- `apps/web/playwright.config.ts` (create)
- `apps/web/e2e/screens.spec.ts` (create)
- `.gitignore` (ignore Playwright output)

**Out of scope:**
- CI workflow. The check depends on fonts and a running stack; it is a local
  tool for now.
- Any component or page change.

## Git workflow

- Branch: `FLO-47` (from `origin/main`).
- Commit message style: `FLO-47 add visual and accessibility check for web`.

## Steps

### Step 1: Install Playwright and axe

`npm install -D -w @flowforge/web @playwright/test @axe-core/playwright`, then
`npx playwright install chromium`.

**Verify**: `npx -w @flowforge/web playwright --version` → prints a version.

### Step 2: Configure Playwright

Create `apps/web/playwright.config.ts`: `testDir: "e2e"`, `outputDir:
"test-results"`, one `chromium` project, `use.baseURL` from
`process.env.WEB_URL ?? "http://localhost:3000"`, `workers: 1`,
`fullyParallel: false`, and a `webServer` that runs `npm run dev` from the
repo root (`cwd: "../.."`) with `url: "http://localhost:3000/signin"` and
`reuseExistingServer: true`, timeout 120 s.

Add the script `"test:visual": "playwright test"` and ignore
`apps/web/test-results/` and `apps/web/playwright-report/` in `.gitignore`.

**Verify**: `npm run typecheck -w @flowforge/web` → exit 0.

### Step 3: Write the walkthrough

Create `apps/web/e2e/screens.spec.ts`. For each width in `[390, 1440]`:

1. Visit `/signup`, check, screenshot. Sign up a unique user
   (`visual+<timestamp>@example.com`, password `northstar2026`).
2. On `/workspaces/new` check and screenshot, then create "Northstar Studio".
3. Overview, Team and Settings: check and screenshot each.
4. On Team, invite `guest+<timestamp>@example.com` as Editor. Read the link
   from the `<code>` element and screenshot.
5. Open the link and screenshot the invitation page while signed in as the
   inviter (this shows the "signed in as someone else" state).

"Check" means a helper `check(page, name)` that:
- runs `new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze()`
  and expects zero violations with impact `serious` or `critical`;
- expects `document.documentElement.scrollWidth <= window.innerWidth`;
- saves `page.screenshot({ path: \`test-results/screens/${width}/${name}.png\`, fullPage: true })`.

**Verify**: with Postgres running, `npm run test:visual -w @flowforge/web` →
tests run, and PNGs exist under `apps/web/test-results/screens/390` and `/1440`.
Failures caused by real accessibility problems in the current UI are
expected; list them in the plan's status row as follow-ups instead of
changing components here.

## Test plan

The spec file is the test. It covers sign-up, onboarding, overview, team,
settings and invitation screens at a phone and a desktop width.

## Done criteria

- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `npm run test:visual -w @flowforge/web` runs and writes screenshots for 7 screens at 2 widths
- [ ] `git status` shows only in-scope files changed

## STOP conditions

- Postgres cannot be started (Docker not available): report, do not mock the API.
- `npm run dev` cannot serve `/signin` within 120 s.
- The Team screen no longer shows the invitation link after inviting.

## Maintenance notes

- Each new screen gets a step in `screens.spec.ts`.
- The axe rule set is WCAG 2.2 AA. Do not disable rules to make a test pass;
  fix the component.
- Moving this into CI needs a Postgres service and pinned fonts; deferred.
