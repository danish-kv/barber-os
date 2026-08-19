"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  CalendarDays,
  CalendarPlus,
  Package,
  Search,
  UserPlus,
  Users,
  Building2,
  ListPlus,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { BRANCHES } from "@/lib/data/seed-static";
import { NAV } from "./nav-config";
import type { Role } from "@/lib/types";

export function CommandPalette({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const customers = useDemoStore((s) => s.data.customers);
  const setOwnerBranchFilter = useDemoStore((s) => s.setOwnerBranchFilter);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href as "/");
  };

  const customerMatches = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
      .slice(0, 6);
  }, [customers, query]);

  const customerHref = (id: string) => {
    switch (role) {
      case "owner":
        return `/owner/customers/${id}`;
      case "receptionist":
        return `/reception/customers?c=${id}`;
      case "barber":
        return `/staff/customers/${id}`;
      default:
        return `/owner/customers/${id}`;
    }
  };

  const quickActions: Array<{ label: string; icon: typeof Search; href: string; roles: Role[] }> = [
    { label: "New booking", icon: CalendarPlus, href: "/reception/calendar?new=1", roles: ["receptionist", "manager"] },
    { label: "Add walk-in", icon: ListPlus, href: "/reception/queue?add=1", roles: ["receptionist", "manager"] },
    { label: "New booking", icon: CalendarPlus, href: "/owner/calendar?new=1", roles: ["owner"] },
    { label: "Add walk-in", icon: ListPlus, href: "/owner/queue?add=1", roles: ["owner"] },
    { label: "Create offer", icon: BadgePercent, href: "/owner/offers?new=1", roles: ["owner"] },
    { label: "Open inventory", icon: Package, href: "/owner/inventory", roles: ["owner"] },
    { label: "Open inventory", icon: Package, href: "/manager/inventory", roles: ["manager"] },
    { label: "Today's calendar", icon: CalendarDays, href: "/owner/calendar", roles: ["owner"] },
    { label: "Add staff", icon: UserPlus, href: "/owner/staff?new=1", roles: ["owner"] },
  ];
  const myActions = quickActions.filter((a) => a.roles.includes(role));

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden h-9 w-56 justify-start gap-2 text-muted-foreground lg:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="text-sm">Search…</span>
        <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-full lg:hidden"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <Search className="size-5" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery("");
        }}
        title="Command palette"
        description="Search customers, navigate, and run quick actions"
      >
        <CommandInput
          placeholder="Search customers, pages, actions…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {customerMatches.length > 0 && (
            <>
              <CommandGroup heading="Customers">
                {customerMatches.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`${c.name} ${c.phone}`}
                    onSelect={() => go(customerHref(c.id))}
                  >
                    <ToneAvatar name={c.name} toneName={c.avatarTone} size="xs" />
                    <span>{c.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{c.phone}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {myActions.length > 0 && (
            <CommandGroup heading="Quick actions">
              {myActions.map((a) => (
                <CommandItem key={a.label + a.href} onSelect={() => go(a.href)}>
                  <a.icon className="size-4" />
                  {a.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {role === "owner" && (
            <CommandGroup heading="Switch branch">
              <CommandItem
                onSelect={() => {
                  setOwnerBranchFilter("all");
                  setOpen(false);
                }}
              >
                <Building2 className="size-4" />
                All branches
              </CommandItem>
              {BRANCHES.map((b) => (
                <CommandItem
                  key={b.id}
                  onSelect={() => {
                    setOwnerBranchFilter(b.id);
                    setOpen(false);
                  }}
                >
                  <Building2 className="size-4" />
                  {b.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Go to">
            {NAV[role].map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <item.icon className="size-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {role !== "customer" && (
            <CommandGroup heading="People">
              <CommandItem onSelect={() => go(role === "owner" ? "/owner/customers" : role === "barber" ? "/staff/customers" : "/reception/customers")}>
                <Users className="size-4" />
                Browse customers
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
