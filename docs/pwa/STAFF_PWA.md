# Staff PWA — architecture and behavior

The barber/staff experience installs to the home screen and launches like a
native app. This is a **web-only** install (URL/QR → Install → icon), no
Play Store packaging. Demo V1.1 behavior is unchanged; everything here is
presentation and shell.

## Identity

| | |
|---|---|
| Manifest URL | `/manifest-staff.webmanifest` (route handler: `app/manifest-staff.webmanifest/route.ts`, `force-static`) |
| Source of truth | `apps/web/lib/pwa-manifest.ts` — consumed by the route handler, the staff/shop layouts, and `scripts/pwa-test.mts` |
| `id` | `/staff-pwa` (stable; distinct from the public site manifest) |
| `name` / `short_name` | `${PRODUCT_NAME} Staff` / `${PRODUCT_SHORT_NAME} Staff` — env-driven, defaults "Barbershop OS Staff" / "Barber OS Staff". No commercial name is hard-coded. |
| `start_url` | `/staff?source=pwa` |
| `scope` | `/` — see below |
| `display` | `standalone`, portrait |
| Colors | background = theme = `#211a13` (charcoal) so launch never flashes white |
| Icons | `staff-icon-{192,512}.png` (any) + `staff-icon-maskable-{192,512}.png` + `staff-apple-touch-icon.png` (180). Scissors mark in the Royal Cuts charcoal/gold language; regenerate via `scripts/make-staff-icons.html` + headless Chrome. |
| Shortcuts | Today, Queue, Customers (`/staff…?source=pwa-shortcut`). No walk-in shortcut: in the premium scenario walk-ins are reception's flow and manifest URLs are static. |

**Two manifests, one origin.** The public site keeps `app/manifest.ts` →
`/manifest.webmanifest` (Royal Cuts identity, `start_url: /demo`). Only the
`/staff` and `/shop` layouts override `metadata.manifest` to the staff
manifest, so customers/reception/owner pages never advertise the staff app.
Browsers distinguish the two installs by `id`.

## Scope decision (§44)

`scope: "/"`, deliberately. A narrow `/staff/` scope would throw these
legitimate staff-app journeys back into browser chrome:

- **solo/small scenarios** — the working context is `/shop/**`, not `/staff/**`
- "Public page" in the More sheet → `/shops/[slug]`
- context recovery → `/demo`

The trade-off (the public site is technically in-scope of the installed app)
is harmless: navigation stays standalone, which is exactly what we want. The
failure mode we're avoiding is mid-task browser-chrome pop-in.

## Launch path (§4/§12)

`start_url` is `/staff?source=pwa`. The staff layout mounts
`StaffScenarioRedirect` (`components/pwa/staff-scenario-redirect.tsx`):

- scenario **premium** → stays on `/staff` (Akhil's Today), `useRoleGate`
  restores the barber persona from persisted state
- scenario **solo/small** → replaced with `/shop` (Danish, Owner · Barber,
  unified shell) — `/staff/queue → /shop/queue`, `/staff/customers →
  /shop/customers`

So one home-screen icon always opens that person's actual working screen; no
role switching after launch. Future production auth slots in cleanly:
`launch → session valid? → /staff : login → back to /staff`.

## Service worker (`public/sw.js`)

Small custom SW — no framework (Serwist et al. would be overkill for this
surface and adds a maintenance dependency; revisit if requirements grow).
Registered by `components/pwa/pwa-client.tsx` in **production builds only**.

| Request | Strategy |
|---|---|
| Navigations | **network-first** → cached copy of that page → `/offline` |
| `/_next/static/**` (hashed, immutable) | cache-first |
| Icons, fonts, manifests | stale-while-revalidate |
| Everything else (incl. any future API) | network only — never cached |

Precache: `/offline`, both manifests, all app icons. Bump `VERSION` in
`sw.js` when precache/strategies change.

**Offline philosophy (§19/§21).** Demo state is deterministic and local
(zustand → localStorage), so visited screens genuinely work offline and demo
changes persist on-device — that is what `/offline` and the offline chip say.
This does NOT extend to production: server data must be network-first with
short-lived caches, and money/queue mutations are never assumed successful
offline. Do not add API caching to this SW when `apps/api` goes live without
revisiting this document.

## Install experience

- `lib/pwa.ts` — module-level `beforeinstallprompt` capture (armed from the
  root layout via `PwaClient`, so the one-shot event is never missed), plus
  `useStandalone`, `useCanInstall`, `useOnline`, `isIOS`, and persisted
  dismissal (`barber-os-pwa-install-dismissed` — plain localStorage so demo
  resets don't resurrect the banner).
- `components/pwa/install-app.tsx`:
  - **InstallCard** — contextual, dismissible CTA on staff Today and shop
    Today (shown only after entering the staff experience; never on first
    landing). Android/Chromium: replays the native prompt. iOS: opens a
    compact Share → "Add to Home Screen" → Add guidance sheet (no Android
    instructions on iOS, and vice versa).
  - **InstallMenuItem** — discoverable "Install app" row in both More sheets.
  - Both render nothing when standalone, after install, or (card) when
    dismissed. `appinstalled` → small success toast, no redirect.

## App-feel details

- Bottom navs: `select-none`, pressed-state scale (`active:scale-95`,
  disabled under `prefers-reduced-motion`), safe-area padding (`pb-safe`).
- `html { -webkit-tap-highlight-color: transparent }`, image drag disabled.
- Standalone only: `overscroll-behavior-y: contain` (no rubber-band behind
  the shell) via `@media (display-mode: standalone)`.
- Barber bottom nav is Today · Queue · Customers · Earnings · More
  (Schedule/Commissions/Leave/Profile moved to More); solo keeps Today ·
  Queue · Customers · Business · More.
- Offline chip (`components/pwa/connectivity-chip.tsx`): "Offline — demo
  changes stay on this device" above the nav; "Back online" flash on
  recovery. Never a modal.

## Future (documented, not implemented)

- **Push notifications**: permission must be requested in context (e.g. when
  enabling "notify me when my next customer checks in"), never at launch.
- **Badging**: `navigator.setAppBadge(waitingCount)` for queue length once
  real-time data exists.
- **QR staff onboarding**: owner shows a QR pointing at the deployed
  `/staff`; deferred — no QR dependency added.
- **Auth**: launch flow above; the redirect component is the natural seam.

## Verification

`pnpm --filter @barbershop-os/web test` runs `scripts/pwa-test.mts`
(manifest shape, icon files + pixel sizes, SW precache coverage, layout
wiring, install-UI gating) after the flow/storyline/flex suites.
