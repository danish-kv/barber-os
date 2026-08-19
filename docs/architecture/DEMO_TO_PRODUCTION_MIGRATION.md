# Demo → Production Migration

> Constraint honored: do NOT rewrite the 83 routes. The demo store is not
> throwaway — it becomes (a) the permanent sales demo and (b) the reference
> implementation the API adapter must match (the storyline test is the
> contract).

## 1. The seam

Today every screen does:

```text
UI component ──selector──▶ useDemoStore(data) ──action──▶ Zustand mutation
```

Target:

```text
UI component ──hook──▶ data-access layer (per domain)
                          ├── demo adapter   = today's store + selectors
                          └── api adapter    = TanStack Query + generated client + SSE
```

Concretely, introduce `apps/web/lib/data-access/<domain>.ts` exposing hooks
that mirror what screens already consume — signatures lifted from the
audited selectors/actions:

```ts
// data-access/queue.ts
export function useQueue(branchId: string): QueueView            // queueForBranch shape
export function useCheckIn(): (appointmentId: string) => Promise<void>
export function useAddWalkIn(): (input: WalkInInput) => Promise<Appointment>
// data-access/booking.ts
export function useAvailability(q: AvailabilityQuery): Slot[]
export function useCreateBooking(): (input: BookingInput) => Promise<BookingResult>
// …orders.ts, customers.ts, staffOps.ts, inventory.ts, analytics.ts, …
```

Adapter selection is a build/runtime flag:
`NEXT_PUBLIC_DATA_MODE = demo | api` — plus a per-route override so `/demo/**`
is always `demo` (see §5). Screens change **one import line** (store hook →
data-access hook) per domain, incrementally, matching the roadmap phases.

**Refactor verdict on the current store:** it already has clean seams —
actions are command-shaped, selectors are pure functions over `DemoData`, and
components never mutate data directly. The only prep work needed before
production wiring was (1) extracting `lib/availability.ts` + checkout math +
queue estimation into `@barbershop-os/domain` (**done in Phase 0A** — the
demo now runs through thin adapters over the shared package), and (2)
wrapping store access behind the data-access hooks above (per-phase). No
store rewrite.

## 2. What stays client state vs becomes server state

| Stays in Zustand (pure UI) | Becomes server state (TanStack Query) |
|---|---|
| language (`session.language`) — also mirrored to user profile when logged in | appointments, queue, availability |
| owner branch filter (also a URL param) | customers, notes, tags, stats |
| open sheets/dialogs, wizard step state, POS basket *draft* | orders, invoices, payments |
| booking-flow in-progress selections (until submit) | loyalty, memberships, usage |
| toasts, command palette, nav state | inventory, POs, vendors |
| — | shifts, leave, commissions |
| — | offers, campaigns, reviews |
| — | notifications (server rows; unread counts) |
| — | all analytics |

The POS basket is the interesting hybrid: draft lines are client state, but
every displayed money number comes from `POST /orders/preview` (debounced) —
client math from `packages/domain` may render instantly, then reconciles to
the server preview before the pay button enables.

## 3. Query/cache/optimism/realtime rules

- **TanStack Query** with key families `['queue', br]`,
  `['appointments', br, date]`, `['availability', br, svcHash, date]`,
  `['dashboard', b, br, date]`, `['customer', id]` …
- **SSE → invalidation**: event type → key family map (REALTIME_AND_EVENTS.md
  §9). No event payload merging; refetch small projections.
- **Optimistic**: check-in, start, assign-staff, mark-read, note-add —
  rollback on 409 with toast ("Someone else updated this queue entry").
  **Never optimistic**: create booking (needs authoritative slot result),
  checkout, payments, PO receive, leave decisions.
- **Errors/offline**: mutations queue is NOT attempted offline (shop
  operations need truth); screens show the existing empty/retry states, and
  queue pages surface a stale-data banner when SSE disconnects > 60s.
  Read caches persist to storage for instant paint (PWA feel preserved).

## 4. Migration mechanics per phase

For each roadmap phase (PRODUCTION_ROADMAP.md):
1. Implement API endpoints + integration tests (port the matching storyline
   assertions server-side first — they define done).
2. Implement the api adapter for that domain's data-access hooks.
3. Flip the domain's hooks from demo→api behind the flag in staging; run the
   E2E storyline against staging.
4. Ship; the demo adapter for that domain stays in the tree (it still powers
   `/demo`).

Status vocabulary note: the demo adapter persists an internal `waiting`
status; production persists `checked_in` only (waiting = queue projection,
DOMAIN_MODEL.md §3). The api adapter maps demo-vocabulary reads so screens
need no change; the demo adapter keeps its historical string untouched.

The **storyline test is the migration contract**: `scripts/storyline-test.mts`
assertions (booking → check-in queue membership → start/complete →
stock/loyalty/membership/commission/revenue effects → leave → PO) get a
server twin executed against a seeded test database. Demo and production must
pass the same behavioral suite.

## 5. Demo mode survives forever

Decision: **Option A now, Option B later, never Option C.**

- **A (now): pure client mock.** `/demo` keeps running today's Zustand +
  seed with zero backend. It costs nothing, can't leak, can't touch tenant
  data, resets deterministically, works offline at sales meetings. The demo
  adapter and `packages/domain` share code with production, so the demo stays
  behaviorally honest as the product evolves.
- **B (later, when sales needs server features shown live): seeded demo
  tenant.** A real business row flagged `is_demo=true` in production:
  excluded from billing/exports/platform analytics, nightly reset job
  (re-seed script = productionized `buildSeed`), banner UI, blocked
  outbound messaging (WhatsApp adapter no-ops for demo tenants).
- **C (rejected): pointing the demo UI at mocked network layers (MSW etc.)**
  — extra machinery for no benefit over A.

Guardrails either way: demo entry points never mint real sessions against
non-demo tenants; `is_demo` checked in messaging, billing, export and webhook
paths; seed IDs (`cu_danish`…) are namespaced so accidental cross-writes are
impossible.

## 6. Route-by-route disposition (summary)

| Area | Disposition |
|---|---|
| `(public)` landing/features/pricing/demo | unchanged, static |
| `/shops/[slug]` + `/book` | first area flipped to api adapter (Phase 2); slug resolves via public, unauthenticated read API |
| `/customer/**` | api adapter Phases 2–6; auth gate replaces auto-persona |
| `/reception/**` `/staff/**` | Phases 3–5 |
| `/manager/**` `/owner/**` | Phases 4–9 (dashboard first, deep pages later) |
| `/admin/**` | last (Phase 11); until then remains demo-only surface |
| `/onboarding` | wired to real business-creation API in Phase 1 (it becomes the actual tenant signup) |
