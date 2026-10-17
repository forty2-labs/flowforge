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

### A workspace always has at least one Owner

- **Why:** otherwise a workspace could be left with nobody able to manage it.
  Only an Owner can change another Owner.
- **Cost:** the last Owner must promote someone else before leaving.

## Data

### Schema changes are committed migration files

- **Why:** every environment applies the same steps in the same order.
- **Cost:** each schema change needs a migration, created with
  `npm run db:migrate -w @flowforge/api`.

### End-to-end tests use their own database

- **Why:** the tests wipe tables before each case. They run against
  `flowforge_test`, never the development database.
- **Cost:** migrations are applied to two databases locally.

### Production deploys apply migrations during the build

- **Why:** the `api` build in [vercel.json](../vercel.json) runs
  `prisma migrate deploy` when `VERCEL_ENV` is `production`, so no one has to
  remember to. A failed migration fails the build, and Vercel keeps the
  previous deployment live. Preview deploys skip it, so a pull request cannot
  change the production database.
- **Cost:** the old deployment serves traffic against the new schema until
  the build finishes, so each migration must work with the code before it.
  Removing or renaming a column takes two deploys. Previews run against the
  production schema, not their own.

## Interface

### Colours are CSS variables first

- **Why:** [tokens.css](../packages/ui/src/tokens.css) defines each value
  once, and [tailwind.css](../packages/ui/src/tailwind.css) maps them to class
  names. A later theme changes values without renaming anything.
- **Cost:** adding a colour means editing two files.

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
