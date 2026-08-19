# Barbershop OS

The operating system for modern barbershops and salons — bookings, walk-in
queue, staff, customers, POS, memberships, loyalty, inventory and analytics.
Built mobile-first for the Indian market (English · മലയാളം).

> "Barbershop OS" is the internal working name; the commercial brand is
> deliberately not hard-coded anywhere (see
> `docs/architecture/PRODUCTION_ARCHITECTURE.md` §4.1).

**Live demo (Demo V1, fully client-side):** https://barber-os-lemon.vercel.app/demo
— one connected shop, six switchable personas, deterministic seeded data,
zero backend.

## Repository structure

```text
apps/
  web/        Next.js 16 app — Demo V1 (83 routes, 6 personas) and the future
              production frontend. Demo state lives in a persisted Zustand
              store (lib/store.ts) backed by a deterministic seed.
  api/        NestJS (Fastify) modular monolith — the production backend.
              Phase 0A: skeleton + GET /v1/health only.
packages/
  domain/     Pure TypeScript business rules shared by web and api:
              scheduling/availability engine, checkout math, queue wait
              estimation, money primitives. No framework/browser/DB deps.
  contracts/  Zod schemas for API contracts (error envelope, pagination,
              primitives). Grows phase by phase.
docs/
  architecture/  Production blueprint (start at README.md there).
```

**Authority rule:** `packages/domain` runs in both apps, but only the API's
results are authoritative. The web app uses it for instant previews; money
never moves based on a client-side calculation.

## Prerequisites

- Node ≥ 20 (developed on 24)
- pnpm 10 (`corepack enable` honors the `packageManager` field)

## Local development

```bash
pnpm install
pnpm dev            # everything via turbo (web :3000, api :4000, package watchers)
# or individually:
pnpm dev:web
pnpm dev:api
```

The API needs no database or secrets in Phase 0A. Optional env for the api:
`PORT`, `HOST`, `LOG_LEVEL`, `CORS_ORIGINS` (required when
`NODE_ENV=staging|production`).

## Commands

```bash
pnpm lint        # all workspaces
pnpm typecheck
pnpm test        # domain unit tests + api tests + web demo regression suite
pnpm build       # packages → api → web production build
pnpm test:storyline   # just the mandatory cross-role demo storyline test
```

## Demo V1

`/demo` runs entirely in the browser (Zustand + localStorage + deterministic
seed) and must keep working forever — it is the permanent sales demo and the
behavioral reference for the production API. Its protection:

- `apps/web/scripts/flow-test.mts` — data-layer smoke (seed, availability, queue, metrics)
- `apps/web/scripts/storyline-test.mts` — 23 assertions across
  booking → check-in → queue → serve → POS → loyalty/membership/stock/commission → owner metrics

Reset demo data anytime from the in-app avatar menu. Frozen baseline: git tag
`demo-v1`.

## API

```bash
pnpm dev:api
curl localhost:4000/v1/health
# {"status":"ok","service":"api","env":"local","version":"0.1.0"}
```

Foundations included: typed zod env validation, structured pino logs with
request-ids and PII redaction, the shared error envelope, `@fastify/helmet`,
env-driven CORS, graceful SIGTERM/SIGINT shutdown, and `rawBody` enabled for
future webhook signature verification.

## Deployment

**Web (Vercel):** set the project's **Root Directory to `apps/web`** (one-time
dashboard setting; "Include files outside root directory" stays on). Vercel
detects pnpm from the lockfile/`packageManager` and Next.js automatically;
`outputFileTracingRoot` in `apps/web/next.config.ts` handles monorepo tracing.
No other configuration required.

**API:** not deployed yet — target is Fly.io (Mumbai) per
`docs/architecture/PRODUCTION_ARCHITECTURE.md`.

## Architecture documentation

Start at [`docs/architecture/README.md`](docs/architecture/README.md) —
production stack decision, domain model & invariants, API design,
realtime/events, security & tenancy, demo→production migration, and the
phased roadmap (current status: Phase 0A complete).
