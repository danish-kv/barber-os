"use client";

// Unified owner+barber mobile shell for the solo/small scenarios (Demo V1.1).
// One person, one interface: no role switching to run the shop. Roles are
// capabilities, not people — the header chip says "Owner · Barber".

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarOff,
  CreditCard,
  Home,
  ListChecks,
  MoreHorizontal,
  Scissors,
  Settings,
  Store,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/store";
import { useHydrated } from "@/lib/demo-provider";
import { ALL_BUSINESSES } from "@/lib/data/seed-static";
import { staffForBranch } from "@/lib/selectors";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { DemoBadge, DemoMenu } from "@/components/shell/demo-controls";

const PRIMARY = [
  { label: "Today", href: "/shop", icon: Home },
  { label: "Queue", href: "/shop/queue", icon: ListChecks },
  { label: "Customers", href: "/shop/customers", icon: Users },
  { label: "Business", href: "/shop/business", icon: BarChart3 },
] as const;

const MORE = [
  { label: "Staff", href: "/shop/staff", icon: Scissors, dynamicSlug: false },
  { label: "POS", href: "/shop/pos", icon: CreditCard, dynamicSlug: false },
  { label: "Settings", href: "/shop/settings", icon: Settings, dynamicSlug: false },
  { label: "Public page", href: "/shops", icon: Store, dynamicSlug: true },
] as const;

export function ShopShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const scenario = useDemoStore((s) => s.session.scenario);
  const data = useDemoStore((s) => s.data);

  // The unified shop app belongs to the solo/small scenarios. Premium demo
  // keeps its six-persona areas — send stray deep links to the picker.
  useEffect(() => {
    if (hydrated && scenario === "premium") router.replace("/demo");
  }, [hydrated, scenario, router]);

  const business = ALL_BUSINESSES.find((b) => b.id === data.businessId);
  const me = staffForBranch(data, data.branchId, { includeInactive: true }).find(
    (s) => s.title.includes("Owner")
  );
  const publicHref = `/shops/${business?.slug ?? ""}`;

  const isActive = (href: string) =>
    href === "/shop" ? pathname === "/shop" : pathname.startsWith(href);
  const moreActive = MORE.some((m) => !m.dynamicSlug && isActive(m.href));

  return (
    <div className="flex min-h-dvh-full flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85 safe-top">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-2.5 px-4 md:max-w-3xl">
          <Link href="/shop" className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar font-heading text-sm font-semibold text-sidebar-primary">
              {business?.logoInitial ?? "S"}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-heading text-sm leading-tight font-semibold">
                {business?.name}
              </span>
              <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                {me ? `${me.name} · ${me.title}` : "Owner"}
              </span>
            </span>
          </Link>
          <DemoBadge className="ml-1 hidden sm:inline-flex" />
          <div className="ml-auto flex items-center gap-1">
            <DemoMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-24 md:max-w-3xl">
        {hydrated && scenario !== "premium" ? (
          children
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        )}
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5 pb-safe md:max-w-3xl">
          {PRIMARY.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href as "/"}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
              moreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className="size-5" aria-hidden />
            More
          </button>
        </div>
      </nav>

      <BottomSheet open={moreOpen} onOpenChange={setMoreOpen} title="More">
        <div className="grid grid-cols-3 gap-2 pb-2">
          {MORE.map((item) => {
            const href = item.dynamicSlug ? publicHref : item.href;
            const active = !item.dynamicSlug && isActive(item.href);
            return (
              <Link
                key={item.label}
                href={href as "/"}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "hover:bg-muted/60"
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <div className="col-span-3 mt-1 flex items-center justify-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
            <CalendarOff className="size-3.5" aria-hidden />
            {data.scenario === "solo"
              ? "Solo shop — everything runs from this one app."
              : "Small shop — no receptionist needed."}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
