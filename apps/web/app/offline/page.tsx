// Offline fallback, served by the service worker when a navigation fails.
// Pure server component: it must read fine as plain HTML even when its JS
// chunks aren't cached, so no client hooks or store access here.

import type { Metadata } from "next";
import { Scissors, WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh-full flex-col items-center justify-center px-6 pb-safe text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-sidebar text-sidebar-primary">
        <Scissors className="size-7" aria-hidden />
      </span>
      <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <WifiOff className="size-3.5" aria-hidden />
        You&apos;re offline
      </span>
      <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">
        Your demo schedule is still available
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Screens you&apos;ve already opened keep working — demo changes stay on
        this device. Reconnect to load anything new.
      </p>
      {/* plain <a>: must work without hydrated JS — a full navigation retry
          is the point */}
      <a
        href="/staff"
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
      >
        Try again
      </a>
    </div>
  );
}
