"use client";

// Scenario-aware PWA launch (Demo PWA §4/§12). The installed staff app's
// start_url is /staff, but in the solo/small scenarios the working context
// is the unified /shop app. This mirrors ShopShell's premium→/demo redirect
// in the other direction, so one home-screen icon always opens the barber's
// actual working screen — no role or scenario picking after launch.

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/store";
import { useHydrated } from "@/lib/demo-provider";

const MAP: Array<[prefix: string, target: string]> = [
  ["/staff/queue", "/shop/queue"],
  ["/staff/customers", "/shop/customers"],
  ["/staff", "/shop"],
];

export function StaffScenarioRedirect() {
  const hydrated = useHydrated();
  const scenario = useDemoStore((s) => s.session.scenario);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated || scenario === "premium") return;
    const hit = MAP.find(([prefix]) => pathname.startsWith(prefix));
    router.replace((hit?.[1] ?? "/shop") as "/");
  }, [hydrated, scenario, pathname, router]);

  return null;
}
