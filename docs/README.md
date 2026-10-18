# Flowforge docs

Notes on what Flowforge is, how the code is put together, and why it was
built this way. Start with the overview, then follow one request through the
architecture page.

| Page | What it answers |
| --- | --- |
| [Overview](overview.md) | What are we building, and in what order? |
| [Architecture](architecture.md) | Which package does what, and how does a request travel through them? |
| [Decisions](decisions.md) | Why was each significant choice made, and what does it cost? |
| [Design](design.md) | How should the interface look, read and behave, on the web and on mobile? |
| [Tooling](tooling.md) | How do npm workspaces, Turborepo, Prisma and the test setup work here? |
| [Deployment](deployment.md) | How do I deploy to Vercel with a Supabase database, set its environment variables and run migrations? |

When a new decision is made, add it to [Decisions](decisions.md) with its
reason and its cost.
