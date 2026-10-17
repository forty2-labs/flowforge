<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

## Git workflow

Work is tracked in Linear (team `FLO`). For every change:

1. Sync first: `git fetch --all --prune`, then `git rebase origin/main`.
2. Branch name is the Linear issue ID, e.g. `FLO-38`. Create the branch from `origin/main` right after creating the Linear issue (`git switch -c FLO-39 origin/main`), not later.
3. Prefix every commit message with the issue ID, e.g. `FLO-38 generate types on ci/cd`.
4. Write the PR description as a raw Markdown file whose title starts with the issue ID, e.g. `# FLO-38: Generate Next route types before typecheck in CI`. Always also print the full raw Markdown in the chat, in a code block, ready to copy.

If no Linear issue exists for the work, ask before creating a branch.
