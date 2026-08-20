"use client";

// Client-side PWA utilities: install-prompt capture, standalone detection,
// connectivity. Kept out of business components — UI reads these hooks, and
// none of them alter product behavior (§8 of the PWA brief).

import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ---------------------------------------------------------------------------
// beforeinstallprompt capture — module-level so the event (which fires once,
// early) is retained no matter when the install UI mounts.
// ---------------------------------------------------------------------------

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let appInstalled = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // no mini-infobar; we show our own contextual CTA
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    appInstalled = true;
    emit();
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** True when the browser has offered a native install prompt we can replay. */
export function useCanInstall() {
  return useSyncExternalStore(
    subscribe,
    () => deferredPrompt !== null,
    () => false
  );
}

/** True once the app was installed during this page's lifetime. */
export function useAppInstalled() {
  return useSyncExternalStore(
    subscribe,
    () => appInstalled,
    () => false
  );
}

/** Replays the captured install prompt. Returns the user's choice. */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  const evt = deferredPrompt;
  await evt.prompt();
  const { outcome } = await evt.userChoice;
  deferredPrompt = null;
  emit();
  return outcome;
}

// ---------------------------------------------------------------------------
// Standalone / platform detection
// ---------------------------------------------------------------------------

function standaloneNow() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's non-standard flag
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

const subscribeDisplayMode = (l: () => void) => {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", l);
  return () => mq.removeEventListener("change", l);
};

/** True when running as an installed app (home-screen launch). */
export function useStandalone() {
  return useSyncExternalStore(subscribeDisplayMode, standaloneNow, () => false);
}

/** iPhone/iPad Safari — no beforeinstallprompt; install is Share → Add to
 * Home Screen, so the UI shows guidance instead of a button. */
export function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports as Mac but has touch
    (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1)
  );
}

// ---------------------------------------------------------------------------
// Connectivity
// ---------------------------------------------------------------------------

const subscribeOnline = (l: () => void) => {
  window.addEventListener("online", l);
  window.addEventListener("offline", l);
  return () => {
    window.removeEventListener("online", l);
    window.removeEventListener("offline", l);
  };
};

export function useOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );
}

// ---------------------------------------------------------------------------
// Install-CTA dismissal — plain localStorage, deliberately outside the demo
// store so "Reset demo data" doesn't resurrect a dismissed banner.
// ---------------------------------------------------------------------------

const DISMISS_KEY = "barber-os-pwa-install-dismissed";

export function installCtaDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallCta() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* storage unavailable — banner just reappears */
  }
}
