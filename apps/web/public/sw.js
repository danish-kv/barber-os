// Barbershop OS demo service worker — small and deliberately conservative.
//
// Demo V1.1 state is deterministic and lives in localStorage (zustand), so
// the honest offline story is: cache the app shell + static assets, and the
// demo keeps working on pages you've visited. We do NOT cache or replay any
// API traffic, and nothing here implies production money/queue mutations
// can safely happen offline — production must be network-first with the
// server as the only authority (see docs/pwa/STAFF_PWA.md).
//
// Bump VERSION whenever precached URLs or strategies change.

const VERSION = "v1";
const PRECACHE = `bos-precache-${VERSION}`;
const RUNTIME = `bos-runtime-${VERSION}`;

const PRECACHE_URLS = [
  "/offline",
  "/manifest-staff.webmanifest",
  "/manifest.webmanifest",
  "/staff-icon-192.png",
  "/staff-icon-512.png",
  "/staff-icon-maskable-192.png",
  "/staff-icon-maskable-512.png",
  "/staff-apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== PRECACHE && k !== RUNTIME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Hashed build assets are immutable — cache-first is safe for them.
function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

// Small stable shell resources worth stale-while-revalidate.
function isShellAsset(url) {
  return (
    /\.(png|ico|svg|woff2?)$/.test(url.pathname) ||
    url.pathname.endsWith(".webmanifest")
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, then the cached copy of that page, then the
  // offline screen. Successful responses are cached so previously visited
  // demo screens keep working offline (local state supplies the data).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached ?? (await caches.match("/offline"));
        })
    );
    return;
  }

  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(RUNTIME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  if (isShellAsset(url)) {
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const cached = await cache.match(request);
        const refresh = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => undefined);
        return cached ?? refresh.then((r) => r ?? Response.error());
      })
    );
    return;
  }

  // Everything else (future API calls included): straight to the network.
  // Deliberately uncached — dynamic business data is never served stale.
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
