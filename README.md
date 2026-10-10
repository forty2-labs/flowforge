# Flowforge

A schema-driven CMS and experience platform: content lives once in a workspace
and is reused by every page, website and, later, app that needs it.

See [docs](docs/README.md) for the product overview, architecture and the
reasoning behind the main decisions.

## Layout

| Path | What it is |
| --- | --- |
| `apps/web` | Next.js workspace app |
| `apps/api` | NestJS REST API with Prisma on PostgreSQL |
| `packages/ui` | Ink & Signal design tokens and base components |
| `packages/types` | Roles, capabilities and API types shared by web and API |

## Run it locally

Needs Node 22 or newer and Docker.

```sh
cp .env.example .env
npm install
npm run db:up                               # Postgres and Redis
npm run db:deploy -w @flowforge/api         # apply migrations
npm run dev                                 # web on :3000, API on :4000
```

No mail provider is connected yet. Invitation links are shown to the inviter
in the Team screen and written to the API log.

## Checks

```sh
npm run lint
npm run typecheck
npm run test
npm run test:e2e -w @flowforge/api          # uses the flowforge_test database
```
