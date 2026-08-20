// Staff PWA identity — the single source of truth for the installed staff
// app's branding and manifest. Consumed by the manifest route handler, the
// staff/shop layout metadata, and scripts/pwa-test.mts.
//
// Branding is env-driven (PRODUCT_NAME / PRODUCT_SHORT_NAME) per the repo
// rule that no commercial name is hard-coded; the fallbacks are the neutral
// working titles. The commercial name can change without touching this file.

const PRODUCT_NAME = process.env.PRODUCT_NAME ?? "Barbershop OS";
const PRODUCT_SHORT_NAME = process.env.PRODUCT_SHORT_NAME ?? "Barber OS";

export const STAFF_APP_NAME = `${PRODUCT_NAME} Staff`;
export const STAFF_APP_SHORT_NAME = `${PRODUCT_SHORT_NAME} Staff`;
export const STAFF_MANIFEST_URL = "/manifest-staff.webmanifest";

/**
 * The staff app manifest.
 *
 * - `id: "/staff-pwa"` — stable identity, distinct from the public site
 *   manifest (/manifest.webmanifest, id defaults to its start_url /demo),
 *   so the two never collide as "the same app" in the browser.
 * - `start_url: "/staff?source=pwa"` — launches into the operational staff
 *   experience. A client redirect in the staff layout re-routes solo/small
 *   scenarios to /shop, so the installed app always opens the working
 *   context the barber actually uses.
 * - `scope: "/"` — deliberately wide. The staff app legitimately needs
 *   /shop (solo owner+barber shell), /shops/[slug] (own public page from
 *   the More sheet) and /demo (context recovery). A narrow /staff/ scope
 *   would bounce those into browser chrome mid-task. The public-site
 *   manifest shares the origin scope; browsers disambiguate installs by
 *   `id`, and out-of-scope escape is the failure mode we care about.
 */
export function staffManifest() {
  return {
    id: "/staff-pwa",
    name: STAFF_APP_NAME,
    short_name: STAFF_APP_SHORT_NAME,
    description: "Appointments, queue, customers and daily shop operations.",
    start_url: "/staff?source=pwa",
    scope: "/",
    display: "standalone" as const,
    orientation: "portrait-primary" as const,
    // Charcoal launch surface — matches the dark themeColor and avoids a
    // white flash before the app shell paints.
    background_color: "#211a13",
    theme_color: "#211a13",
    icons: [
      { src: "/staff-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/staff-icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/staff-icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable" as const,
      },
      {
        src: "/staff-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable" as const,
      },
    ],
    // Daily actions only. No walk-in shortcut: in the premium scenario
    // walk-ins are reception's flow, and manifest URLs are static — the
    // in-app quick actions cover it per scenario.
    shortcuts: [
      {
        name: "Today",
        url: "/staff?source=pwa-shortcut",
        icons: [{ src: "/staff-icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Queue",
        url: "/staff/queue?source=pwa-shortcut",
        icons: [{ src: "/staff-icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Customers",
        url: "/staff/customers?source=pwa-shortcut",
        icons: [{ src: "/staff-icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
