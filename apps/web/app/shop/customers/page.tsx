"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { allCustomerStats } from "@/lib/selectors";
import { dayLabel, inr } from "@/lib/format";

export default function ShopCustomersPage() {
  const data = useDemoStore((s) => s.data);
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCustomerStats(data, data.branchId)
      .filter(
        (s) =>
          !q ||
          s.customer.name.toLowerCase().includes(q) ||
          s.customer.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
      .sort((a, b) => (b.lastVisit ?? "").localeCompare(a.lastVisit ?? ""));
  }, [data, query]);

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Customers</h1>

      <div className="relative">
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 rounded-full pl-10"
        />
      </div>

      {stats.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "No matches" : "No customers yet"}
          description="Customers you add or serve appear here with their history."
        />
      ) : (
        <ul className="grid gap-2">
          {stats.map((s) => (
            <li key={s.customer.id}>
              <Link
                href={`/shop/customers/${s.customer.id}` as "/"}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors hover:bg-muted/40"
              >
                <ToneAvatar
                  name={s.customer.name}
                  toneName={s.customer.avatarTone}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.customer.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.visits} visits · {inr(s.lifetimeSpend, { compact: true })}
                    {s.lastVisit && ` · last ${dayLabel(s.lastVisit)}`}
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
