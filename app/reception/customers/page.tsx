"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { CustomerProfile } from "@/components/staff/customer-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoStore } from "@/lib/store";
import { allCustomerStats } from "@/lib/selectors";
import { dayLabel, inr } from "@/lib/format";

const BRANCH_ID = "br_kakkanad";

function ReceptionCustomersInner() {
  const data = useDemoStore((s) => s.data);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(
    searchParams.get("c") ?? null
  );

  const stats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCustomerStats(data, BRANCH_ID)
      .filter(
        (s) =>
          !q ||
          s.customer.name.toLowerCase().includes(q) ||
          s.customer.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
      .sort((a, b) => (b.lastVisit ?? "") .localeCompare(a.lastVisit ?? ""))
      .slice(0, 40);
  }, [data, query]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader title="Customers" description="Branch customer directory" />

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
        <EmptyState icon={Users} title="No matches" description="Try a different name or number." />
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {stats.map((s) => (
            <li key={s.customer.id}>
              <button
                onClick={() => setSelected(s.customer.id)}
                className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-left transition-colors hover:bg-muted/40"
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
              </button>
            </li>
          ))}
        </ul>
      )}

      <BottomSheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
        title="Customer profile"
        contentClassName="sm:max-w-xl"
      >
        {selected && (
          <CustomerProfile
            customerId={selected}
            backHref="/reception/customers"
          />
        )}
      </BottomSheet>
    </div>
  );
}

export default function ReceptionCustomersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <ReceptionCustomersInner />
    </Suspense>
  );
}
