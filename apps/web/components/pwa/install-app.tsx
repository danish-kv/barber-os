"use client";

// Install experience for the staff PWA (§13–§16 of the PWA brief):
// - <InstallCard/>  — contextual, dismissible CTA on the staff/shop Today
//   screens. Native prompt where available, iOS guidance sheet otherwise.
// - <InstallMenuItem/> — always-discoverable entry for the More sheets.
// Both render nothing when already running standalone or after install.

import { useState, useSyncExternalStore } from "react";
import { Share, Smartphone, SquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import {
  dismissInstallCta,
  installCtaDismissed,
  isIOS,
  promptInstall,
  useAppInstalled,
  useCanInstall,
  useStandalone,
} from "@/lib/pwa";
import { STAFF_APP_SHORT_NAME } from "@/lib/pwa-manifest";
import { useHydrated } from "@/lib/demo-provider";
import { cn } from "@/lib/utils";

function IOSGuideSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Add ${STAFF_APP_SHORT_NAME} to your Home Screen`}
    >
      <ol className="grid gap-3 pb-4">
        {(
          [
            [Share, "Tap the Share button in Safari's toolbar"],
            [SquarePlus, "Choose “Add to Home Screen”"],
            [Smartphone, "Tap Add — the app appears on your home screen"],
          ] as const
        ).map(([Icon, step], i) => (
          <li key={i} className="flex items-center gap-3 rounded-xl border bg-card p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-4.5 text-primary" aria-hidden />
            </span>
            <span className="text-sm">
              <span className="mr-1.5 font-semibold">{i + 1}.</span>
              {step}
            </span>
          </li>
        ))}
      </ol>
    </BottomSheet>
  );
}

/** Contextual install CTA for the staff/shop Today screens. */
export function InstallCard() {
  const hydrated = useHydrated();
  const standalone = useStandalone();
  const canInstall = useCanInstall();
  const installed = useAppInstalled();
  const [iosOpen, setIosOpen] = useState(false);
  // localStorage read must not run during SSR/first paint
  const dismissed = useSyncExternalStore(
    () => () => {},
    () => installCtaDismissed(),
    () => true
  );
  const [hidden, setHidden] = useState(false);

  const ios = hydrated && isIOS();
  const show =
    hydrated &&
    !standalone &&
    !installed &&
    !dismissed &&
    !hidden &&
    (canInstall || ios);
  if (!show) return null;

  const install = async () => {
    if (canInstall) {
      const outcome = await promptInstall();
      if (outcome === "accepted") setHidden(true);
    } else {
      setIosOpen(true);
    }
  };

  const dismiss = () => {
    dismissInstallCta();
    setHidden(true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-sidebar p-4 text-sidebar-foreground">
      <button
        onClick={dismiss}
        aria-label="Dismiss install suggestion"
        className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent"
      >
        <X className="size-4" aria-hidden />
      </button>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-accent/60">
          <Smartphone className="size-5 text-sidebar-primary" aria-hidden />
        </span>
        <div className="min-w-0 pr-6">
          <p className="text-sm font-semibold text-sidebar-accent-foreground">
            Install the Barber App
          </p>
          <p className="mt-0.5 text-xs text-sidebar-foreground/75">
            Today&apos;s queue, customers and appointments straight from your
            home screen.
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" className="h-9 flex-1" onClick={install}>
          Install
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-9 text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={dismiss}
        >
          Not now
        </Button>
      </div>
      <IOSGuideSheet open={iosOpen} onOpenChange={setIosOpen} />
    </div>
  );
}

/** "Install app" row for More sheets — discoverable even after the card was
 * dismissed. Hidden when standalone/installed or when no path exists. */
export function InstallMenuItem({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const standalone = useStandalone();
  const canInstall = useCanInstall();
  const installed = useAppInstalled();
  const [iosOpen, setIosOpen] = useState(false);

  const ios = hydrated && isIOS();
  if (!hydrated || standalone || installed || (!canInstall && !ios)) return null;

  return (
    <>
      <button
        onClick={() => (canInstall ? promptInstall() : setIosOpen(true))}
        className={cn(
          "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition-colors hover:bg-muted/60",
          className
        )}
      >
        <Smartphone className="size-5" aria-hidden />
        Install app
      </button>
      <IOSGuideSheet open={iosOpen} onOpenChange={setIosOpen} />
    </>
  );
}
