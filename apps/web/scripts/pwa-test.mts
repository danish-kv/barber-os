// Staff PWA checks (PWA brief §46): manifest shape, icon files, service
// worker precache coverage, per-layout manifest wiring, install-UI gating.
// Pure static checks — no server or browser needed, so they run in CI.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { staffManifest, STAFF_MANIFEST_URL } from "../lib/pwa-manifest";

let failures = 0;
const check = (name: string, cond: boolean, detail = "") => {
  if (cond) console.log(`  ✓ ${name}`);
  else { failures++; console.error(`  ✗ ${name} ${detail}`); }
};

const root = join(import.meta.dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

function pngSize(p: string): [number, number] {
  const buf = readFileSync(join(root, p));
  // PNG signature + IHDR: width at byte 16, height at byte 20 (big-endian)
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

// ---------------- Manifest shape ----------------
console.log("— Staff manifest —");
const m = staffManifest();
check("stable id", m.id === "/staff-pwa");
check("name present", m.name.length > 0 && m.name.includes("Staff"), m.name);
check("short_name present", m.short_name.length > 0, m.short_name);
check("start_url launches into staff", m.start_url.startsWith("/staff"), m.start_url);
check("display standalone", m.display === "standalone");
check("scope is origin-wide (solo /shop stays in-app)", m.scope === "/");
check("background/theme set (no white launch flash)",
  m.background_color === m.theme_color && /^#[0-9a-f]{6}$/i.test(m.background_color));
check("has 192 + 512 any-purpose icons",
  m.icons.some((i) => i.sizes === "192x192" && !("purpose" in i)) &&
    m.icons.some((i) => i.sizes === "512x512" && !("purpose" in i)));
check("has maskable icons",
  m.icons.filter((i) => "purpose" in i && i.purpose === "maskable").length >= 2);
check("shortcuts are few and in-scope",
  m.shortcuts.length <= 4 && m.shortcuts.every((s) => s.url.startsWith("/staff")));

console.log("— Icon files —");
for (const icon of m.icons) {
  const p = join("public", icon.src);
  const exists = existsSync(join(root, p));
  check(`${icon.src} exists`, exists);
  if (exists) {
    const [w, h] = pngSize(p);
    const want = Number(icon.sizes.split("x")[0]);
    check(`${icon.src} is ${icon.sizes}`, w === want && h === want, `${w}x${h}`);
  }
}
check("apple touch icon exists (180px)",
  existsSync(join(root, "public/staff-apple-touch-icon.png")) &&
    pngSize("public/staff-apple-touch-icon.png")[0] === 180);

// ---------------- Route wiring ----------------
console.log("— Route wiring —");
const manifestRoute = read("app/manifest-staff.webmanifest/route.ts");
check("manifest route handler is static + uses shared identity",
  manifestRoute.includes("force-static") && manifestRoute.includes("staffManifest"));

const staffLayout = read("app/staff/layout.tsx");
const shopLayout = read("app/shop/layout.tsx");
check("staff layout links the staff manifest",
  staffLayout.includes("STAFF_MANIFEST_URL"));
check("shop (solo owner+barber) layout links the staff manifest",
  shopLayout.includes("STAFF_MANIFEST_URL"));
check("staff layout mounts the scenario-aware launch redirect",
  staffLayout.includes("StaffScenarioRedirect"));
check("root layout keeps the public site manifest (other personas untouched)",
  read("app/layout.tsx").includes('manifest: "/manifest.webmanifest"'));
check("staff manifest URL constant matches the route path",
  STAFF_MANIFEST_URL === "/manifest-staff.webmanifest");

// ---------------- Service worker ----------------
console.log("— Service worker —");
const sw = read("public/sw.js");
check("service worker exists", sw.length > 0);
check("offline page precached", sw.includes('"/offline"'));
check("staff icons precached",
  m.icons.every((i) => sw.includes(`"${i.src}"`)));
check("staff manifest precached", sw.includes(`"${STAFF_MANIFEST_URL}"`));
check("navigations are network-first (never stale-served when online)",
  sw.indexOf("fetch(request)") < sw.indexOf('caches.match("/offline")'));
check("no API caching (conservative demo policy)",
  !sw.includes("/api/") && !sw.includes("/v1/"));
check("registered in production only",
  read("components/pwa/pwa-client.tsx").includes('NODE_ENV !== "production"'));
check("offline page exists and is a server component (works without JS)",
  existsSync(join(root, "app/offline/page.tsx")) &&
    !read("app/offline/page.tsx").includes('"use client"'));

// ---------------- Install UI gating ----------------
console.log("— Install UI —");
const installUi = read("components/pwa/install-app.tsx");
check("install UI hidden when running standalone",
  installUi.includes("useStandalone") && installUi.includes("!standalone"));
check("install UI hidden after install", installUi.includes("useAppInstalled"));
check("dismissal is persisted", installUi.includes("dismissInstallCta"));
check("iOS gets guidance, not a dead button",
  installUi.includes("isIOS") && installUi.includes("Home Screen"));
check("install entries live in both More sheets",
  read("components/shell/app-shell.tsx").includes("InstallMenuItem") &&
    read("components/shop/shop-shell.tsx").includes("InstallMenuItem"));

if (failures) {
  console.error(`\n${failures} FAILURES`);
  process.exit(1);
}
console.log("\nStaff PWA checks passed.");
