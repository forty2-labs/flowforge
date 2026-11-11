# Decisions

Each entry says what was chosen, why, and what it costs. Add new decisions at
the end of the relevant section.

## Structure

### One repository for all packages

- **Why:** a change to a role or a response shape updates the API and the web
  app in one commit, and TypeScript flags whichever side falls behind.
- **Cost:** packages must build in the right order. Turborepo handles that.

### The browser talks only to Next.js, never to the API

- **Why:** the session cookie stays on one origin, and the API does not need
  to be reachable from browsers.
- **Cost:** one extra network hop per request, and every change to data goes
  through a server action.

### Permissions are defined once and enforced in the API

- **Why:** [roles.ts](../packages/types/src/roles.ts) maps each capability to
  a minimum role. The API enforces it on every request. The web app reads the
  same table only to hide controls a person cannot use.
- **Cost:** none significant. The rule to remember is that hiding a button is
  never the protection.

### TanStack Query manages data in the browser, through Next.js only

- **Why:** phase 2 needs a browser cache: entry lists that filter and page,
  autosave, upload progress. TanStack Query adds caching, retries and
  pending and error states without breaking the rule above. Mutations call
  server actions from `useMutation`. Reads go to route handlers under
  `apps/web/src/app/api`, which call `api()` on the server, because server
  actions are POST-only and run one at a time. Every screen uses it. Sign-in
  writes the session into the cache and signing out clears it. The overview
  and Team screens share one cache entry for members and one for invitations:
  the server fetches them for the first render and hands them over with
  `HydrationBoundary`, and each team mutation invalidates them.
- **Cost:** a server action called from a mutation returns its error as data
  (`ActionResult`), because Next.js hides thrown messages in production, and
  cannot `redirect()`, so the client navigates instead. Forms driven by a
  mutation need JavaScript to submit. Every read the browser makes needs its
  own route handler. Session guards (`requireSession`, `requireWorkspace`)
  and the invitation preview stay in server components, because they
  redirect or 404 before anything renders.

## Security

### Sessions are database rows, not JWTs

- **Why:** signing out or removing a member takes effect immediately, because
  the row is deleted.
- **Cost:** one database lookup per request.

### Session and invitation tokens are stored hashed

- **Why:** a leaked database does not hand out working logins or invite links.
- **Cost:** a token cannot be shown again after it is created. This is why an
  invitation link is displayed once and "New link" replaces the old one.

### Passwords use scrypt from Node's standard library

- **Why:** a sound algorithm with no native dependency to break installs.
- **Cost:** tuning parameters are Node's defaults rather than hand-picked.

### Non-members get a 404, not a 403

- **Why:** a 403 would confirm that a workspace with that name exists.
- **Cost:** a person who mistypes a URL and a person without access see the
  same message.

### Invitations are tied to an email address

- **Why:** someone who obtains the link cannot join unless they are signed in
  with the invited address.
- **Cost:** the invited person must use that exact address.

### Email goes through Resend's HTTP API, not Supabase

- **Why:** Supabase Auth only emails its own auth users and caps its built-in
  sender, so it cannot send our invitations. Resend's HTTP API needs no SDK or
  SMTP connection, and the same account can later serve as Supabase's SMTP
  provider. Without a key, mail is logged, so development and tests need no
  account.
- **Cost:** one more service and secret per environment. A failed delivery
  does not fail the action that triggered it: invitations still show the link
  and say whether the email went out.

### A workspace always has at least one Owner

- **Why:** otherwise a workspace could be left with nobody able to manage it.
  Only an Owner can change another Owner.
- **Cost:** the last Owner must promote someone else before leaving.

### Supabase tables keep Row Level Security on, with no policies

- **Why:** Supabase serves every table in `public` through its REST API to
  anyone holding the public anon key. With RLS on and no policies, the `anon`
  and `authenticated` roles read and write nothing, so `User`, `Session` and
  the rest stay private. Our API is unaffected: Prisma connects as `postgres`,
  the table owner, which RLS does not restrict. For the same reason, EXECUTE
  on Supabase's `public.rls_auto_enable()` event trigger function is revoked
  from `public`, `anon` and `authenticated`, so the REST API cannot call it.
- **Cost:** this is per-project setup in the Supabase SQL Editor, not a Prisma
  migration, because local Docker and CI have no `rls_auto_enable()`. A new
  Supabase project needs the `revoke` again, and every new table needs RLS
  on: Supabase's event trigger enables it, but check the Security Advisor
  after each deploy that adds a table. Nothing in the app can use Supabase's
  REST API or client libraries for data until policies are written.

## Data

### Schema changes are committed migration files

- **Why:** every environment applies the same steps in the same order.
- **Cost:** each schema change needs a migration, created with
  `npm run db:migrate -w @flowforge/api`.

### End-to-end tests use their own database

- **Why:** the tests wipe tables before each case. They run against
  `flowforge_test`, never the development database.
- **Cost:** migrations are applied to two databases locally.

### Deploys apply migrations during the build

- **Why:** the `api` build in [vercel.json](../vercel.json) runs
  `prisma migrate deploy` for production and preview deploys, so no one has
  to remember to. A failed migration fails the build, and Vercel keeps the
  previous deployment live. Previews use a separate Supabase staging project,
  set through Preview-scoped `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING` in
  Vercel, so a pull request's migrations reach staging, never production.
- **Cost:** the old deployment serves traffic against the new schema until
  the build finishes, so each migration must work with the code before it.
  Removing or renaming a column takes two deploys. All previews share one
  staging database, so a migration from an abandoned pull request stays
  there; reset staging when it drifts from `main`. If the Preview variables
  ever point at production again, pull requests migrate production.

## Interface

### Colours are CSS variables first

- **Why:** [tokens.css](../packages/ui/src/tokens.css) defines each value
  once, and [tailwind.css](../packages/ui/src/tailwind.css) maps them to class
  names. A later theme changes values without renaming anything.
- **Cost:** adding a colour means editing two files.

### Interface type is Schibsted Grotesk; content is Newsreader

- **Why:** Geist is the face every new Next.js app starts with, so it made
  Flowforge look like a template. Schibsted Grotesk was drawn for a news
  publisher, which suits a publishing tool. Setting published content in
  Newsreader makes content and chrome easy to tell apart.
- **Cost:** a departure from the design package, which specifies Geist. The
  boards stay as they are; [design.md](design.md) records the difference.

### The lifecycle dot is the one signature element

- **Why:** a distinctive interface needs one memorable thing, and the
  draft-to-published lifecycle is what Flowforge is about. The dot comes from
  the logo, so the mark and the brand say the same thing.
- **Cost:** every status everywhere must go through `StatusMark`, including in
  the mobile app.

### Surfaces are frosted glass over an ambient ground

- **Why:** the owner chose a translucent look for the web app and the admin
  screens. Glass reads well only when the app controls what is behind it, so
  every page draws a calm gradient ground and the glass sits on that, never
  on photos or customer content. That keeps text contrast measurable.
- **Cost:** contrast must be checked against the blended glass colour in both
  themes, `backdrop-filter` costs some GPU time on low-end phones, and the
  fallbacks in `glass.css` (no blur support, reduced transparency, more
  contrast) must stay. A popular Dribbble style, so the identity relies on
  the type, the lifecycle dot and the ink proof panel to stay our own.

### Light, dark and system themes from one set of tokens

- **Why:** people expect their device setting to be followed, and an admin
  tool is used for long sessions. Semantic token names meant dark mode was a
  second set of values, not a rewrite.
- **Cost:** every new colour token needs a dark value checked for contrast,
  and the dark block in `tokens.css` appears twice (media query and
  attribute), which must stay identical. The choice lives in `localStorage`,
  so it does not follow the person to another device.

### A highlight colour for numbers, separate from the action colour

- **Why:** counts and trends need to catch the eye without looking clickable.
  Cobalt stays the only action colour.
- **Cost:** a second accent invites overuse. It is limited to small pills and
  chips.

### Complex components come from shadcn, restyled

- **Why:** menus, popovers, comboboxes and date pickers are hard to make
  accessible. shadcn copies Radix-based source we own, and its theming uses
  CSS variables like ours, so its names are aliases of our tokens.
- **Cost:** each copied component must be restyled before use, and
  `tailwind-merge` must be told every custom type size, or it drops classes.
  Token names must not collide with shadcn's colour names (`text-input` was
  renamed `text-control` for this reason).
- **Not done:** rebuilding simple components (buttons, fields, badges) on
  shadcn, since ours already follow the tokens. Replacing `ConfirmDialog` and
  `Toast` with shadcn's Dialog and Sonner, since ours are tested; revisit if
  nested dialogs or stacked toasts are needed.

### The UI package ships TypeScript source

- **Why:** no build step for the UI package. Next.js compiles it, via
  `transpilePackages` in [next.config.ts](../apps/web/next.config.ts).
- **Cost:** only tools that compile TypeScript can consume it.

## Inherited from the generators

These came from the project scaffolds rather than from a decision. They are
kept so the frameworks' documentation matches the code.

| Default | Where | Effect |
| --- | --- | --- |
| Cache components | Next.js | Pages are prerendered where possible. Data fetched per request must sit inside a loading boundary. |
| ES modules | NestJS | Relative imports in the API end in `.js`. |
| Vitest and oxlint | NestJS | Test runner and linter for the API. |
| npm instead of pnpm | This machine | pnpm was not installed when the repository was created. |
