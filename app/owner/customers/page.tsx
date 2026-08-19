"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { customerSegments } from "@/lib/selectors";
import { dayLabel, inr } from "@/lib/format";
import { cn } from "@/lib/utils";

type Segment = "all" | "new" | "vip" | "inactive30" | "inactive60";

const SEGMENTS: Array<{ id: Segment; label: string }> = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "vip", label: "VIP" },
  { id: "inactive30", label: "Inactive 30d" },
  { id: "inactive60", label: "Inactive 60d" },
];

export default function OwnerCustomersPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment>("all");

  const segments = useMemo(
    () => customerSegments(data, branchFilter),
    [data, branchFilter]
  );

  const list = useMemo(() => {
    const base =
      segment === "new"
        ? segments.newCustomers
        : segment === "vip"
          ? segments.vip
          : segment === "inactive30"
            ? segments.inactive30
            : segment === "inactive60"
              ? segments.inactive60
              : segments.all;
    const q = query.trim().toLowerCase();
    return base
      .filter(
        (s) =>
          !q ||
          s.customer.name.toLowerCase().includes(q) ||
          s.customer.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
      .sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)
      .slice(0, 60);
  }, [segments, segment, query]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Customers"
        description={`${segments.all.length} customers · ${segments.vip.length} VIP · ${segments.inactive60.length} need a win-back`}
      />

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

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:px-0">
        {SEGMENTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSegment(s.id)}
            aria-pressed={segment === s.id}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              segment === s.id
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:bg-muted"
            )}
          >
            {s.label}
            <span className="ml-1.5 opacity-70">
              {s.id === "all"
                ? segments.all.length
                : s.id === "new"
                  ? segments.newCustomers.length
                  : s.id === "vip"
                    ? segments.vip.length
                    : s.id === "inactive30"
                      ? segments.inactive30.length
                      : segments.inactive60.length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Users} title="No customers in this view" />
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {list.map((s) => (
            <li key={s.customer.id}>
              <Link
                href={`/owner/customers/${s.customer.id}` as "/"}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors hover:bg-muted/40"
              >
                <ToneAvatar
                  name={s.customer.name}
                  toneName={s.customer.avatarTone}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold">
                    {s.customer.name}
                    {s.customer.tags.includes("vip") && (
                      <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold text-warning-foreground dark:text-warning">
                        VIP
                      </span>
                    )}
                  </p>
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
