# AGENTS.md

## Overview

This directory is the Medusa backend (`@medusajs/medusa` v2.19, Node 20+/22+, PostgreSQL 15+) for the `ecommerce-luxe` project. It is one package inside the repo-root pnpm workspace (`../web` is the sibling Next.js storefront) — there is no nested monorepo or `turbo.json` here; this directory *is* the Medusa app.

## Directory Structure

```text
apps/backend/
├── medusa-config.ts          # Medusa config: DB URL, CORS, secrets, modules
├── instrumentation.ts
├── integration-tests/        # setup.js (Jest setupFiles) and http/*.spec.ts suites
└── src/
    ├── admin/                # Admin dashboard extensions (widgets/, i18n/, routes)
    ├── api/                  # API routes: api/store/*, api/admin/* (file-based)
    ├── jobs/                 # Scheduled jobs
    ├── links/                # Module links between modules
    ├── migration-scripts/    # Data migration scripts (e.g. initial-data-seed.ts)
    ├── modules/               # Custom modules (service + models + migrations)
    ├── subscribers/          # Event subscribers
    └── workflows/            # Workflows and workflow steps
```

The storefront (`../web`) is a plain Next.js app, not the Medusa Next.js starter — it talks to this backend over the Store API using `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

## Package Manager

pnpm, managed from the repo root (`ecommerce-luxe/pnpm-workspace.yaml` lists `apps/*`). Never introduce a second lockfile inside `apps/backend`.

## Commands

Run from the repo root unless noted.

```bash
pnpm dev:backend                     # backend only (http://localhost:9000, admin at /app)
pnpm db:up                           # start Postgres (5434) + Redis (6379) via docker compose
pnpm build:backend
```

### Database (run from apps/backend)

```bash
cd apps/backend
pnpm exec medusa db:migrate                  # run migrations
pnpm exec medusa db:generate <module-name>   # generate migrations for a custom module
pnpm exec medusa user -e admin@example.com -p supersecret
pnpm run seed                                # seeds demo data (see package.json)
```

## Medusa Skills & MCP Server

Optional but recommended — they give documentation-backed answers instead of guesses about Medusa v2 APIs, which changed significantly from v1.

**Agentic skills:**

```bash
/plugin marketplace add medusajs/medusa-agent-skills
/plugin install medusa-dev@medusa
```

Load `building-with-medusa` before backend work (modules, API routes, workflows, data models, module links), and `building-admin-dashboard-customizations` before touching `src/admin`.

**MCP server** (official docs, prefer over web search/memory for Medusa API/config questions):

```bash
claude mcp add --transport http medusa https://docs.medusajs.com/mcp
```

## Code Style

- Must satisfy `@medusajs/eslint-plugin`'s recommended config (`eslint.config.ts`). A lint failure here usually means the code is actually wrong (bad route/workflow/module shape), not just cosmetic. Never disable a `@medusajs/*` rule to make lint pass — fix the code.
- No semicolons. Double quotes, 2-space indent.
- Files: kebab-case. Types/classes: PascalCase. Functions/variables: camelCase. DB columns: snake_case.
- No emojis in code, comments, or commit messages.

## Conventions

- **Backend routing is file-based.** A store endpoint is `src/api/store/<path>/route.ts` exporting `GET`/`POST`/etc. Don't add a router or register routes manually.
- **Business logic belongs in workflows**, not in route handlers. Routes resolve and run a workflow; workflows compose steps.
- Never trust prices/totals sent by the storefront — recompute against Medusa before creating a Stripe Payment Intent (see `apps/web/AGENTS.md` / project security requirements).

## Common Mistakes

- Assuming this directory is itself a monorepo root — it isn't; workspace commands run from the repo root, one level up.
- Installing a dependency at the repo root instead of inside `apps/backend` (`cd apps/backend && pnpm add <pkg>`).
- Editing a custom module's model without running `pnpm exec medusa db:generate <module>` — the migration is missing and the change silently never applies.
- Calling the Medusa API from the storefront without `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`; requests fail with a publishable-key error, not an obvious 401.
- Running the test task without a reachable PostgreSQL — integration suites need a live DB (`pnpm db:up` from repo root).
- Silencing `@medusajs/*` ESLint rules instead of fixing the underlying pattern.

## Off-Limits

- `apps/backend/.medusa/`, `dist/`, `.turbo/` — build output, regenerated.
- The repo-root lockfile (`pnpm-lock.yaml`) — never hand-edit or delete; change it only as a side effect of a package manager command.
- `.env` / `.env.local` — never commit, print, or copy secret values out of them. Edit `.env.template` instead when documenting a new variable.
- Existing migrations in `src/modules/*/migrations/` — add a new migration rather than rewriting one that may already have run.
- Don't run destructive DB commands (drops, resets) against the database without explicit confirmation.
