<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Barbershop OS — project notes

Interactive multi-role demo of a barbershop SaaS (Royal Cuts, Kochi). Next.js 16 App Router + TS + Tailwind v4 + shadcn (radix-nova) + zustand.

- All demo state lives in one persisted zustand store: `lib/store.ts` (localStorage key `barber-os-demo`). Bump `SEED_VERSION` there whenever seed shape/storyline changes so stale persisted data reseeds.
- Deterministic seed: `lib/data/seed.ts` (+ seed-static/customers/operations/business), seeded RNG in `lib/data/rng.ts`. Dates are relative to "now"; store auto-reseeds after 18h.
- Derived data (metrics, queue, insights) is in `lib/selectors.ts`; scheduling engine in `lib/availability.ts` (duration-aware, honors working hours/leave/existing bookings — never assume 30-min slots).
- Personas/permissions: `lib/personas.ts`. Route areas adopt their persona on visit (see `useRoleGate` in `components/shell/app-shell.tsx`).
- Shells: `MobileAppShell` (customer/barber, bottom nav) and `DashboardShell` (reception/manager/owner/admin, sidebar+bottom nav) in `components/shell/app-shell.tsx`.
- i18n: `lib/i18n.ts` dictionary (en/ml) — customer-facing surfaces only.
- Commands: `npm run dev | build | lint | typecheck | test` (test = headless data-layer smoke in `scripts/flow-test.mts`).
- Chart colors (`--chart-1..5`) are CVD-validated for both themes — don't swap arbitrarily.
