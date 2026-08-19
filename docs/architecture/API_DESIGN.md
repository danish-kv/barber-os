# API Design

> The 37 Zustand actions in `lib/store.ts` are the audited write surface;
> `lib/selectors.ts` is the audited read surface. This API maps those to
> server-authoritative endpoints. Contracts live as zod schemas in
> `packages/contracts` and generate both the OpenAPI spec and the typed
> client used by `apps/web`.

## 1. Conventions

- Base: `https://api.<API_DOMAIN>/v1` — the host comes from deploy-time
  configuration (`API_PUBLIC_URL`); no product domain is hard-coded anywhere
  in code or docs (final brand TBD; "Barbershop OS" is the internal name).
- AuthN: httpOnly session cookie (web) or `Authorization: Bearer <opaque token>`
  (future native apps). See SECURITY_AND_TENANCY.md.
- Tenancy: business scope comes from the URL (`/businesses/:businessId/…`);
  the server verifies the session's membership grants that scope. Customer
  self-service endpoints (`/me/…`) are scoped by the session user instead.
- **Idempotency**: any POST that moves money or creates a booking accepts
  `Idempotency-Key: <uuid>`; replays return the original result with
  `Idempotent-Replay: true`.
- Errors (RFC 7807-ish):

```json
{ "error": { "code": "slot_conflict", "message": "That time was just taken.",
             "details": { "nextAvailable": "2026-08-21T12:15:00+05:30" } } }
```

Stable `code` strings; HTTP: 400 validation, 401 authn, 403 tenancy/role,
404 not-found-in-tenant (never reveal cross-tenant existence), 409 state/
conflict, 422 domain rule, 429 rate limit.

- Pagination: cursor-based `?cursor=&limit=`, response `{ items, nextCursor }`.
- Money: integer paise in and out. Dates: ISO 8601 with offset.

## 2. API families → demo action mapping

| Family | Endpoints (representative) | Replaces demo action / selector |
|---|---|---|
| `/auth` | `POST /auth/otp/request`, `POST /auth/otp/verify`, `GET /auth/session`, `POST /auth/logout`, `POST /auth/logout-all`, `GET /auth/sessions` | `enterRole` (becomes real login + membership context) |
| `/me` | `GET /me`, `GET /me/memberships`, `GET /me/bookings`, `GET /me/loyalty`, `GET /me/membership-plans` | customer area selectors |
| `/businesses/:b` | CRUD business, `GET /branches`, branch hours | seed-static, onboarding wizard |
| `…/services` | catalog CRUD + addons + branch overrides | `SERVICES`, owner/services |
| `…/staff` | staff CRUD, working hours, `GET /staff/:id/performance` | `STAFF`, `staffPerformance` |
| `…/availability` | `GET` (below) | `availableSlotsForStaff/AnyStaff` |
| `…/appointments` | create, get, list, `POST :id/cancel|reschedule|check-in|start|complete|no-show|assign-staff` | `createBooking`…`markNoShow`, `assignStaff` |
| `…/queue` | `GET /branches/:br/queue`, `POST /branches/:br/walk-ins` | `queueForBranch`, `addWalkIn` |
| `…/waitlist` | `POST /waitlist`, `POST /waitlist/:id/notify` | `joinWaitlist`, `resolveWaitlist` |
| `…/orders` | `POST /orders/preview`, `POST /orders`, `GET /orders/:id` | `checkout` (split: preview vs commit) |
| `…/payments` | `POST /payments/intents`, `POST /webhooks/razorpay` (platform-level), `GET /orders/:id/payments` | simulated UPI sheet |
| `…/customers` | business-customer list/search/get, notes, tags | CRM pages, `addCustomerNote`, `customerStats` |
| `…/loyalty` | `GET /customers/:id/loyalty`, `POST /loyalty/adjust` | loyalty pages |
| `…/memberships` | plans CRUD, `POST /customers/:id/memberships`, usage | membership pages |
| `…/inventory` | items, `POST /stock-movements` (adjust), vendors, `POST /purchase-orders`, `POST /purchase-orders/:id/receive` | inventory actions |
| `…/staff-ops` | `POST /leave-requests`, `POST /leave-requests/:id/decide`, shifts, `POST /staff/:id/break` | `requestLeave`, `decideLeave`, `toggleBreak` |
| `…/register` | `POST /register-sessions/open|close`, `GET /register-sessions/current` | `closeRegister` |
| `…/marketing` | offers CRUD/toggle, campaigns CRUD, `POST /campaigns/:id/send` | offer/campaign actions |
| `…/reviews` | list, `POST /reviews/:id/response` | `respondToReview` |
| `…/analytics` | `GET /dashboard`, `GET /revenue?granularity=`, `GET /insights`, … | `metricsForDay`, `revenueTrend`, `businessInsights`, `hourlyLoad` |
| `…/notifications` | list, mark-read | notification center |
| `/admin` | platform tenants, subscriptions, tickets, impersonation grants | admin area |
| `/events` | `GET /businesses/:b/branches/:br/events` (SSE) | localStorage sharing |

## 3. Critical contracts

### 3.1 Availability

```http
GET /v1/businesses/{b}/branches/{br}/availability
    ?services=svc_uuid1,svc_uuid2&staff=stf_uuid|any&date=2026-08-21
```

```json
{
  "date": "2026-08-21",
  "durationMin": 45,
  "slots": [
    { "start": "2026-08-21T11:15:00+05:30", "staffId": "stf_akhil",
      "period": "morning", "demand": "normal" },
    { "start": "2026-08-21T17:30:00+05:30", "staffId": "stf_akhil",
      "period": "evening", "demand": "almost_full" }
  ],
  "waitlistAvailable": true
}
```

Server-side engine = `packages/domain/availability` (the demo engine, moved).
Slots are *advisory*; the create call re-validates (see concurrency).

### 3.2 Create appointment

```http
POST /v1/businesses/{b}/branches/{br}/appointments
Idempotency-Key: 0c1f…
```
```json
{
  "customer": { "profileId": "cus_…" },           // or { "name": "...", "phone": "..." } from reception
  "services": [ { "serviceId": "svc_hcb" } ],
  "addons": [ "add_beardoil" ],
  "staffId": "stf_akhil",                          // or "any"
  "start": "2026-08-21T17:30:00+05:30",
  "paymentPolicy": "advance"                        // advance | full | pay_at_shop
}
```
`201`:
```json
{
  "appointment": { "id": "apt_…", "status": "confirmed",
    "start": "…", "end": "…", "staffId": "stf_akhil",
    "priceSnapshot": { "subtotalPaise": 35000, "advancePaise": 10000 } },
  "payment": { "required": true, "intent": {
      "provider": "razorpay", "providerOrderId": "order_Nxx",
      "amountPaise": 10000, "keyId": "rzp_live_…" } }
}
```
`409 slot_conflict` when the exclusion constraint rejects; response includes
3 alternative slots. If `paymentPolicy != pay_at_shop`, the appointment is
created in `status: "pending_payment"` with a 10-min TTL hold — capacity is
held by the row itself because `pending_payment` **is part of the exclusion
constraint's status set** (DOMAIN_MODEL invariants #1/#1b). On TTL expiry a
job flips it to `expired`, which frees the slot; a payment webhook landing
after expiry triggers auto-refund rather than resurrection.

### 3.3 Check-in / start / complete / no-show (state commands)

```http
POST /v1/businesses/{b}/appointments/{id}/check-in     {}
POST /v1/businesses/{b}/appointments/{id}/start        {}
POST /v1/businesses/{b}/appointments/{id}/assign-staff { "staffId": "stf_nikhil" }
POST /v1/businesses/{b}/appointments/{id}/complete     {}
POST /v1/businesses/{b}/appointments/{id}/no-show      {}
```
Each returns the updated appointment + emits the matching domain event.
Illegal transitions → `409 invalid_transition` with `currentStatus`.
`complete` runs the transactional fan-out (stock consumption, event outbox);
loyalty/commission wait for checkout — matching the demo, where completion
readies checkout and money effects land at POS time.

### 3.4 Walk-in

```http
POST /v1/businesses/{b}/branches/{br}/walk-ins
```
```json
{ "customer": { "businessCustomerId": "bc_…" } ,   // or { "name": "Shafi", "phone": null }
  "services": [ { "serviceId": "svc_haircut" } ],
  "staffId": null }
```
→ appointment `{ source: "walk_in", status: "checked_in", queuePosition: 3,
estimatedWaitMin: 18 }`.

### 3.5 Queue state

```http
GET /v1/businesses/{b}/branches/{br}/queue
```
```json
{
  "asOf": "2026-08-21T17:42:00+05:30",
  "serving": [ { "appointmentId": "apt_1", "staffId": "stf_rahul",
                 "customerName": "Amritha H.", "serviceSummary": "Beard Trim",
                 "remainingMin": 4 } ],
  "waiting": [ { "appointmentId": "apt_2", "position": 1, "customerName": "Shafi",
                 "preferredStaffId": null, "estimatedWaitMin": 8 } ],
  "staff":   [ { "staffId": "stf_akhil", "state": "free" },
               { "staffId": "stf_nikhil", "state": "break" } ],
  "readyForCheckout": [ { "appointmentId": "apt_9", "orderDraftTotalPaise": 35000 } ]
}
```
Same projection as demo `queueForBranch` (check-in-anchored — the QA-proven
rule), computed server-side; clients subscribe to `queue.updated` on SSE and
refetch this endpoint.

### 3.6 Checkout — preview then commit

```http
POST /v1/businesses/{b}/orders/preview
```
```json
{ "appointmentId": "apt_…",
  "lines": [ { "kind": "service", "refId": "svc_hcb", "qty": 1 },
             { "kind": "product", "refId": "itm_beardoil", "qty": 1 } ],
  "manualDiscountPaise": 0, "loyaltyPointsToRedeem": 100, "tipPaise": 5000 }
```
→ full server-computed breakdown (subtotal, membershipDiscount with which
entitlements consumed, loyaltyRedeemed, advanceCredit, tax, `totalDuePaise`)
**without side effects**. The POS renders exactly this — the client never
computes money.

```http
POST /v1/businesses/{b}/orders            (Idempotency-Key required)
```
Same body + `"payments": [ { "method": "cash", "amountPaise": 20000 },
{ "method": "upi", "amountPaise": 12400 } ]`.
- `method: "upi"` with online collection → responds with a Razorpay intent to
  confirm; order stays `open` until `payments.confirm`/webhook.
- cash/card-offline/static-QR → order commits `paid` immediately.

`201` returns the invoice (lines, totals, receiptNo, loyaltyEarned,
membershipUsage[], commissionEntries summary) — the storyline test's
assertions become this endpoint's integration test.

### 3.7 Payments

```http
POST /v1/businesses/{b}/payments/intents   { "orderId"?: …, "appointmentId"?: …, "amountPaise": 10000 }
POST /v1/webhooks/razorpay                 (platform route, signature-verified)
```
Webhook handler: verify `X-Razorpay-Signature` → `INSERT INTO payment_event
(provider,event_id,…) ON CONFLICT DO NOTHING` → if inserted, process in txn
(update PAYMENT, then ORDER/APPOINTMENT state) → emit `payment.completed`.

### 3.8 Leave

```http
POST /v1/businesses/{b}/leave-requests            { staffId, startDate, endDate, reason }
POST /v1/businesses/{b}/leave-requests/{id}/decide { "decision": "approved" }
```
Approval txn: update request → upsert SHIFT rows to `leave` → outbox
`leave.approved` (notifies staff; availability changes implicitly).

### 3.9 Purchase orders

```http
POST /v1/businesses/{b}/purchase-orders                    { vendorId, branchId, items:[{itemId,qty,unitCostPaise}] }
POST /v1/businesses/{b}/purchase-orders/{id}/receive       {}   // status-guarded
```
Receive txn: guard `status='ordered'` → insert `purchase_receipt`
STOCK_MOVEMENTs → cached qty update → `inventory.restocked` event.

### 3.10 Owner dashboard summary

```http
GET /v1/businesses/{b}/analytics/dashboard?branch=all|br_…&date=2026-08-21
```
Returns exactly the shape the owner home consumes today: day metrics
(revenue/appointments/walkIns/customers/avgTicket/noShowRate), 14-day trend,
staff-30d top5, service-30d top5, segments counts, low-stock list, pending
leave count, insights[]. One endpoint, one round-trip, cache 30s.

## 4. Server-authoritative calculations (moved off the client)

availability & slot validity · all pricing snapshots · membership entitlement
+ discount · loyalty earn/redeem amounts · advance credit · tax · order totals
· commission entries (rule snapshot) · queue positions & wait estimates ·
inventory deltas · refund amounts · every analytics number. The web app keeps
`packages/domain` for **instant previews** (e.g. slot grid rendering, POS
running total) but always displays server `preview`/`commit` results before
money moves.

## 5. Versioning & compatibility

- URL-versioned (`/v1`); additive changes only within a version.
- `packages/contracts` is the single source: server validates with it, client
  is generated from it — drift is a compile error.
- Webhooks from providers are never versioned by us; adapters normalize into
  internal events.

## 6. Demo V1.1 amendments — flexible shop modes

New/changed surface validated by Demo V1.1 (see DOMAIN_MODEL.md §9):

```text
GET   /v1/branches/:id/policy                 → BRANCH_POLICY (public read is a filtered subset)
PATCH /v1/branches/:id/policy                 owner/manager; drives public page + booking gating

POST  /v1/public/shops/:slug/booking-requests   online_request mode only; guest-friendly
GET   /v1/public/booking-requests/:id           status polling for the request page
POST  /v1/booking-requests/:id/accept           staff; creates APPOINTMENT in-txn (optional new start)
POST  /v1/booking-requests/:id/suggest          staff; body { suggestedStart }
POST  /v1/booking-requests/:id/decline          staff
POST  /v1/public/booking-requests/:id/accept-suggestion   customer accepts suggested time

POST  /v1/staff                                body includes employmentType, accessType,
                                               activeFrom/activeUntil (temporary/contract)
POST  /v1/staff/:id/reactivate                 body { activeUntil } — window update, history untouched
POST  /v1/staff/:id/invite                     managed → app_user upgrade (sends OTP invite)
```

Gating rules (server-authoritative, mirrors demo behavior):

- `POST /v1/public/…/appointments` → **403 `branch_mode_forbidden`** unless
  branch policy is `online_instant`.
- `…/booking-requests` → 403 unless `online_request`.
- Staff-authenticated appointment creation is allowed in **every** mode —
  that is what `staff_only` means.
- `staff_selection='shop'` strips staff identity from public availability
  responses (slots carry no `staffId`).
