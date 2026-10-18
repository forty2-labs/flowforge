# Deployment: Vercel and Supabase

How Flowforge is deployed to Vercel with a Supabase Postgres database, from
an empty Vercel account to a working sign-up.

## How it fits together

One Vercel project runs two [services](https://vercel.com/docs/services),
defined in [vercel.json](../vercel.json):

| Service | Code | Reachable from |
| --- | --- | --- |
| `web` | [apps/web](../apps/web) (Next.js) | The internet, on every path |
| `api` | [apps/api](../apps/api) (NestJS) | Only `web`, through a service binding |

The browser only ever talks to `web`. The Next.js server calls `api` at the
URL Vercel injects as `API_URL`, and `api` talks to Supabase Postgres.

## Environment variables

| Variable | Read by | Where it comes from |
| --- | --- | --- |
| `API_URL` | `web` | Injected by the service binding. **Never set it yourself.** |
| `POSTGRES_URL` | `api` at runtime | Injected by the Supabase integration. The pooled (transaction-mode) URL. |
| `POSTGRES_URL_NON_POOLING` | Prisma migrations | Injected by the Supabase integration. |
| `WEB_ORIGIN` | `api` (CORS) | **You set it.** Required: the API won't start in production without it. |
| `DATABASE_URL` | `api` and Prisma | Overrides both `POSTGRES_*` URLs. Used locally from `.env`. **Don't set it in Vercel** unless the database isn't connected through the integration. |

The integration also adds `POSTGRES_PRISMA_URL`, `POSTGRES_USER`,
`SUPABASE_URL`, the Supabase API keys and similar. Flowforge doesn't use
them.

The fallbacks are in [apps/api/src/env.ts](../apps/api/src/env.ts) and
[apps/api/prisma.config.ts](../apps/api/prisma.config.ts).

## Step 1: Create the Vercel project

1. On vercel.com: **Add New → Project** → import the `flowforge` repository.
2. Leave **Root Directory** at the repository root. Vercel reads
   `vercel.json` from there and detects both services.
3. Deploy. The first deployment may fail until steps 2 and 3 are done.
   That's expected.

## Step 2: Add the Supabase database

1. In the Vercel project: **Storage → Create Database → Supabase**, or
   install Supabase from the Vercel Marketplace.
2. **Region:** East US (North Virginia), to match Vercel's default function
   region `iad1`. A distant region adds latency to every query.
3. Set a strong database password and keep it in a password manager. Use
   only letters and digits: characters like `@ # / ? %` break connection
   URLs unless they're encoded.
4. Connect the database to this Vercel project. In the connection's
   **Sync environment variables** settings, turn on **Production** and
   **Preview**.

> **Preview shares the production database.** With Preview sync on,
> preview deployments use the production credentials, so test sign-ups on a
> PR preview land in production data. Giving previews their own database is
> tracked in FLO-41.

5. In Vercel → **Settings → Environment Variables**, search for `POSTGRES`.
   You should see `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING` for
   Production and Preview.

## Step 3: Set `WEB_ORIGIN`

1. Find the production URL under **Settings → Domains**, for example
   `flowforge.vercel.app`.
2. **Settings → Environment Variables → Add:**
   - Key: `WEB_ORIGIN`
   - Value: `https://flowforge.vercel.app`, with `https://` and no trailing slash
   - Environments: **Production** and **Preview**
3. Save.

## Step 4: Run the Prisma migrations

Migrations create the tables. Run them **from your own machine**, from the
repository root. Nothing runs them on deploy.

1. In the Supabase dashboard: **Connect → Direct** tab → copy the
   **Session pooler** string (port **5432**). Replace `[YOUR-PASSWORD]` with
   the database password.

   | Connection | Port | Use for migrations? |
   | --- | --- | --- |
   | Direct connection | 5432 | No: IPv6-only on the free tier, often unreachable from WSL and home networks |
   | **Session pooler** | 5432 | **Yes** |
   | Transaction pooler | 6543 | No: migrations need a session-mode connection |

2. Install dependencies if you haven't: `npm install`.
3. Run the migrations, pasting the URL when prompted. Nothing appears while
   you paste. Reading the URL this way keeps the password out of your shell
   history.

   ```bash
   read -rs -p "Supabase session pooler URL: " DATABASE_URL && echo
   DATABASE_URL="$DATABASE_URL" npm run db:deploy -w @flowforge/api
   unset DATABASE_URL
   ```

4. Check the output. The datasource line must name a `supabase.com` host,
   **not** `localhost`:

   ```
   Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-0-us-east-1.pooler.supabase.com:5432"
   ...
   All migrations have been successfully applied.
   ```

   If it says `localhost`, the URL didn't get through, and you migrated your
   local database instead. Run step 3 again.

5. In Supabase → **Table Editor**, the tables and `_prisma_migrations`
   should now exist.

**Run this again whenever a new folder appears in
[apps/api/prisma/migrations](../apps/api/prisma/migrations)**, before or
along with the deployment that needs it. Running it with nothing new is
harmless.

## Step 5: Deploy and check

1. Environment variables only apply to new deployments. Go to
   **Deployments → latest Production deployment → ⋯ → Redeploy**.
2. Open the site. Signed out, `/` should redirect to `/signin`.
3. **Sign up.** That goes from web to the binding to the API to Supabase.
   The new user should appear in Supabase → Table Editor → `User`.
4. If something fails, go to **Logs**, filter by environment and by the
   `api` or `web` service, and match the error below.

## Troubleshooting

| Error in the logs | Cause | Fix |
| --- | --- | --- |
| "This page couldn't load" on the site | The API call from `web` failed. The real error is in the `api` logs. | Check the `api` service logs. |
| `Missing environment variable DATABASE_URL or POSTGRES_URL` | The integration variables aren't enabled for this environment, or they were added after this deployment. | Turn on sync for that environment (step 2), then redeploy. |
| `Missing environment variable WEB_ORIGIN` | Not set for this environment. | Step 3, then redeploy. |
| `API_URL is not set.` (in `web`) | The service binding didn't resolve. | Check the `bindings` entry for `web` in [vercel.json](../vercel.json). |
| `SyntaxError: Cannot use import statement outside a module` | The deployment was built before the API's ESM fix (FLO-40). | Redeploy from current `main`. |
| `self-signed certificate in certificate chain` | The deployment was built before the Supabase CA fix (FLO-42). | Redeploy from current `main`. |
| `P1001: Can't reach database server` (migrations) | You used the Direct connection string (IPv6-only). | Use the Session pooler string. |
| `P1000: Authentication failed` (migrations) | Wrong password. | Reset it under Supabase → Project Settings → Database. |
| `prepared statement ... already exists` (migrations) | You used the Transaction pooler (port 6543). | Use the Session pooler (port 5432). |

## How the API trusts Supabase's certificate

Supabase's certificates chain to its private **Supabase Root 2021 CA**,
which Node doesn't trust by default. The CA is embedded in
[apps/api/src/prisma/supabase-ca.ts](../apps/api/src/prisma/supabase-ca.ts).
For Supabase hosts,
[apps/api/src/prisma/connection.ts](../apps/api/src/prisma/connection.ts)
removes the `ssl*` parameters from the URL (`pg` would let them override the
CA) and verifies the full chain, hostname included.

Don't "fix" certificate errors with `uselibpqcompat=true` or
`rejectUnauthorized: false`. Both turn off certificate verification. The CA
is valid until **2031-04-26**. Before then, download the replacement from
Supabase → Project Settings → Database → SSL Configuration and update
`supabase-ca.ts`.

## Local development

Nothing here changes local development. The root `.env` sets `DATABASE_URL`
to the docker-compose Postgres, which takes priority over the `POSTGRES_*`
variables. Never put Supabase credentials in `.env` or anywhere else in the
repository.
