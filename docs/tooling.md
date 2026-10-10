# Tooling

## npm workspaces

The root [package.json](../package.json) declares
`"workspaces": ["apps/*", "packages/*"]`. npm treats each folder under those
paths as a package, installs all dependencies into one root `node_modules`,
and links the local packages to each other.

A workspace is addressed by the `name` in its own `package.json`. The `-w`
flag runs a script inside one workspace:

```sh
npm run db:deploy -w @flowforge/api
```

npm finds the workspace named `@flowforge/api`, switches into `apps/api`, and
runs the `db:deploy` script defined there. Without `-w`, npm looks only at the
root scripts.

## Turborepo

npm workspaces install and link packages. Turborepo runs their scripts in the
right order. It does three things here:

- **Runs one command everywhere.** `npm run build` at the root calls
  `turbo run build`, which runs `build` in every workspace that has one.
- **Orders tasks by dependency.** In [turbo.json](../turbo.json),
  `"dependsOn": ["^build"]` means "build the packages I depend on first". The
  API imports `@flowforge/types`, so types is compiled before the API starts.
- **Caches results.** If a package has not changed, Turborepo replays the
  saved output. `dev` is not cached because it keeps running.

| Command | Handled by | What happens |
| --- | --- | --- |
| `npm run dev` | Turborepo | Starts the types watcher, the API and the web app |
| `npm run build` | Turborepo | Builds every package in dependency order |
| `npm run lint`, `typecheck`, `test` | Turborepo | Runs the check in every package |
| `npm run db:up`, `db:down` | npm | Starts or stops Postgres and Redis in Docker |
| `npm run <script> -w <name>` | npm | Runs one script in one workspace |

## Prisma

Prisma is the layer between the API and PostgreSQL.

| Command (add `-w @flowforge/api`) | Use |
| --- | --- |
| `npm run db:migrate` | After editing the schema: creates a migration file and applies it to the development database |
| `npm run db:deploy` | Applies existing migrations without creating new ones. Used on a fresh checkout and in CI. |
| `npm run db:generate` | Regenerates the typed client in `src/generated`. Runs automatically on install, build and dev. |

The generated client is not committed.

## Environment

One `.env` file at the repository root serves the API and Prisma. Copy
[.env.example](../.env.example) to create it. The web app reads `API_URL` and
falls back to `http://localhost:4000`.

## Tests

| Kind | Where | Runs with |
| --- | --- | --- |
| Unit | `apps/api/src/**/*.spec.ts` | `npm run test` |
| End-to-end | [apps/api/test](../apps/api/test) | `npm run test:e2e -w @flowforge/api` |

The end-to-end tests start the real API against the `flowforge_test` database
and exercise it over HTTP, including the role rules.

## Continuous integration

[.github/workflows/ci.yml](../.github/workflows/ci.yml) runs lint, typecheck,
unit tests, end-to-end tests and build on every push to `main` and on every
pull request.
