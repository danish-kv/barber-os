"use client";

// Subtle connection indicator (§23): a small chip above the bottom nav when
// offline, and a brief "Back online" flash on recovery. Never a modal —
// demo state is local, so offline is informational, not blocking.

import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useOnline } from "@/lib/pwa";
import { cn } from "@/lib/utils";

export function ConnectivityChip() {
  const online = useOnline();
  const [showRecovered, setShowRecovered] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      setShowRecovered(true);
      const t = setTimeout(() => setShowRecovered(false), 2500);
      return () => clearTimeout(t);
    }
  }, [online]);

  if (online && !showRecovered) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center pb-safe"
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2",
          online
            ? "bg-success text-white"
            : "bg-foreground text-background"
        )}
      >
        {online ? (
          <>
            <Wifi className="size-3.5" aria-hidden />
            Back online
          </>
        ) : (
          <>
            <WifiOff className="size-3.5" aria-hidden />
            Offline — demo changes stay on this device
          </>
        )}
      </span>
    </div>
  );
}
