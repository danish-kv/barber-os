"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { customerStats } from "@/lib/selectors";
import { dayLabel } from "@/lib/format";

const STAFF_ID = "st_akhil";

export default function StaffCustomersPage() {
  const data = useDemoStore((s) => s.data);
  const [query, setQuery] = useState("");

  // Customers this barber has actually served, most recent first.
  const myCustomers = useMemo(() => {
    const seen = new Map<string, string>(); // customerId -> last visit iso
    for (const a of data.appointments) {
      if (a.staffId !== STAFF_ID || a.status !== "completed") continue;
      const prev = seen.get(a.customerId);
      if (!prev || a.start > prev) seen.set(a.customerId, a.start);
    }
    const q = query.trim().toLowerCase();
    return [...seen.entries()]
      .map(([customerId, lastVisit]) => ({
        stats: customerStats(data, customerId)!,
        lastVisit,
      }))
      .filter((e) => e.stats)
      .filter(
        (e) =>
          !q ||
          e.stats.customer.name.toLowerCase().includes(q) ||
          e.stats.customer.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
      .sort((a, b) => (a.lastVisit < b.lastVisit ? 1 : -1));
  }, [data, query]);

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        My customers
      </h1>

      <div className="relative">
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 rounded-full pl-10"
        />
      </div>

      {myCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "No matches" : "No customers yet"}
          description={
            query
              ? `Nobody matching "${query}" in your served customers.`
              : "Customers you've served will appear here."
          }
        />
      ) : (
        <ul className="grid gap-2">
          {myCustomers.map(({ stats, lastVisit }) => (
            <li key={stats.customer.id}>
              <Link
                href={`/staff/customers/${stats.customer.id}` as "/"}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors hover:bg-muted/40"
              >
                <ToneAvatar
                  name={stats.customer.name}
                  toneName={stats.customer.avatarTone}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {stats.customer.name}
                    {stats.customer.tags.includes("vip") && (
                      <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold text-warning-foreground dark:text-warning">
                        VIP
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {stats.visits} visits · last {dayLabel(lastVisit)}
                    {stats.customer.preferences[0] && ` · ${stats.customer.preferences[0]}`}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
