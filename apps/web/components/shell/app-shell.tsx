"use client";

// Two shell architectures, one file of shared plumbing:
//  - MobileAppShell: consumer-app feel (customer, barber). Bottom nav always,
//    content centered at a phone-friendly max width even on desktop.
//  - DashboardShell: operational (reception, manager, owner, admin). Dark
//    sidebar on desktop, bottom nav + "More" sheet on mobile.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/store";
import { useHydrated } from "@/lib/demo-provider";
import { PERSONAS } from "@/lib/personas";
import type { Role } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { NAV, type NavItem } from "./nav-config";
import { ConnectivityChip } from "@/components/pwa/connectivity-chip";
import { InstallMenuItem } from "@/components/pwa/install-app";
import { DemoBadge, DemoMenu } from "./demo-controls";
import { NotificationCenter } from "./notification-center";
import { CommandPalette } from "./command-palette";
import { BranchSelector } from "./branch-selector";

function useRoleGate(role: Role) {
  // Demo-mode gate: deep links & role switches should never dead-end.
  // Visiting an area adopts that area's persona.
  const sessionRole = useDemoStore((s) => s.session.role);
  const enterRole = useDemoStore((s) => s.enterRole);
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && sessionRole !== role) enterRole(role);
  }, [hydrated, sessionRole, role, enterRole]);
  return hydrated;
}

function isActive(pathname: string, href: string, rootHref: string) {
  if (href === rootHref) return pathname === rootHref;
  return pathname === href || pathname.startsWith(href + "/");
}

function BottomNav({
  role,
  items,
  moreItems,
}: {
  role: Role;
  items: NavItem[];
  moreItems: NavItem[];
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const rootHref = PERSONAS[role].home;
  const showMore = moreItems.length > 0;
  const primary = showMore ? items.slice(0, 4) : items.slice(0, 5);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85 select-none md:hidden"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5 pb-safe">
          {primary.map((item) => {
            const active = isActive(pathname, item.href, rootHref);
            return (
              <Link
                key={item.href}
                href={item.href as "/"}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-[color,transform] active:scale-95 motion-reduce:active:scale-100",
                  active ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}
              >
                <item.icon className={cn("size-5", active && "fill-primary/10")} aria-hidden />
                {item.label}
              </Link>
            );
          })}
          {showMore && (
            <button
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                moreItems.some((i) => isActive(pathname, i.href, rootHref))
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <MoreHorizontal className="size-5" aria-hidden />
              More
            </button>
          )}
        </div>
      </nav>

      <BottomSheet open={moreOpen} onOpenChange={setMoreOpen} title="More">
        <div className="grid grid-cols-3 gap-2 pb-2">
          {role === "barber" && <InstallMenuItem />}
          {moreItems.map((item) => {
            const active = isActive(pathname, item.href, rootHref);
            return (
              <Link
                key={item.href}
                href={item.href as "/"}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition-colors",
                  active ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/60"
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}

function ShellSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// MobileAppShell — customer & barber
// ---------------------------------------------------------------------------

export function MobileAppShell({
  role,
  title,
  children,
  headerExtra,
  hideHeader = false,
}: {
  role: Role;
  title?: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
  hideHeader?: boolean;
}) {
  const hydrated = useRoleGate(role);
  const items = NAV[role].filter((i) => i.primary);
  const moreItems = NAV[role].filter((i) => !i.primary);

  return (
    <div className="flex min-h-dvh-full flex-col bg-background">
      {!hideHeader && (
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85 safe-top">
          <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-4 md:max-w-3xl">
            <Link href={PERSONAS[role].home as "/"} className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar text-sidebar-primary">
                <Scissors className="size-4" aria-hidden />
              </span>
              <span className="font-heading text-base font-semibold tracking-tight">
                {title ?? "Royal Cuts"}
              </span>
            </Link>
            <DemoBadge className="ml-1 hidden sm:inline-flex" />
            <div className="ml-auto flex items-center gap-1">
              {headerExtra}
              <NotificationCenter role={role} />
              <DemoMenu />
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-24 md:max-w-3xl">
        {hydrated ? children : <ShellSkeleton />}
      </main>

      {/* Desktop: top-style nav for the same items */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 hidden border-t bg-background/95 backdrop-blur md:block"
      >
        <DesktopInlineNav role={role} items={[...items, ...moreItems]} />
      </nav>

      <BottomNav role={role} items={items} moreItems={moreItems} />
      <ConnectivityChip />
    </div>
  );
}

function DesktopInlineNav({ role, items }: { role: Role; items: NavItem[] }) {
  const pathname = usePathname();
  const rootHref = PERSONAS[role].home;
  return (
    <div className="mx-auto flex h-14 max-w-3xl items-center justify-center gap-1 px-4">
      {items.map((item) => {
        const active = isActive(pathname, item.href, rootHref);
        return (
          <Link
            key={item.href}
            href={item.href as "/"}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardShell — reception, manager, owner, admin
// ---------------------------------------------------------------------------

export function DashboardShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const hydrated = useRoleGate(role);
  const pathname = usePathname();
  const items = NAV[role];
  const primary = items.filter((i) => i.primary);
  const moreItems = items.filter((i) => !i.primary);
  const rootHref = PERSONAS[role].home;
  const persona = PERSONAS[role];

  // Group sidebar items by section (owner uses sections; others don't).
  const sections = new Map<string, NavItem[]>();
  for (const item of items) {
    const key = item.section ?? "";
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key)!.push(item);
  }

  return (
    <div className="flex min-h-dvh-full bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh-full w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-primary">
            <Scissors className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-semibold text-sidebar-accent-foreground">
              {role === "admin" ? "Barbershop OS" : "Royal Cuts"}
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/70">
              {persona.title}
            </p>
          </div>
        </div>
        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
          {[...sections.entries()].map(([section, sectionItems]) => (
            <div key={section || "main"} className="mt-2">
              {section && (
                <p className="px-2 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-sidebar-foreground/50 uppercase">
                  {section}
                </p>
              )}
              <ul className="grid gap-0.5">
                {sectionItems.map((item) => {
                  const active = isActive(pathname, item.href, rootHref);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href as "/"}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="size-4 shrink-0" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <DemoBadge />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85 safe-top">
          <div className="flex h-14 items-center gap-2 px-4 lg:h-16 lg:px-6">
            <Link
              href={rootHref as "/"}
              className="flex shrink-0 items-center gap-2 lg:hidden"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar text-sidebar-primary">
                <Scissors className="size-4" aria-hidden />
              </span>
              {/* Owner header also carries the branch selector — drop the
                  wordmark on very narrow phones to keep controls tappable. */}
              <span
                className={cn(
                  "font-heading text-base font-semibold whitespace-nowrap",
                  role === "owner" && "max-[430px]:hidden"
                )}
              >
                {role === "admin" ? "OS Admin" : "Royal Cuts"}
              </span>
            </Link>
            {role === "owner" && <BranchSelector className="ml-1 hidden sm:flex" />}
            <div className="ml-auto flex items-center gap-1.5">
              {role === "owner" && <BranchSelector className="flex sm:hidden" />}
              <CommandPalette role={role} />
              <NotificationCenter role={role} />
              <DemoMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 pb-24 lg:px-6 lg:py-6 lg:pb-8">
          {hydrated ? children : <ShellSkeleton />}
        </main>
      </div>

      <BottomNav role={role} items={primary} moreItems={moreItems} />
    </div>
  );
}
