"use client";

import { subDays, startOfDay } from "date-fns";
import { MapPin, Phone, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { useDemoStore } from "@/lib/store";
import { invoicesForRange, metricsForDay, reviewSummary, staffPerformance } from "@/lib/selectors";
import { BRANCHES, STAFF } from "@/lib/data/seed-static";
import { inr, percent } from "@/lib/format";

export default function OwnerBranchesPage() {
  const data = useDemoStore((s) => s.data);
  const setOwnerBranchFilter = useDemoStore((s) => s.setOwnerBranchFilter);
  const now = new Date();
  const from30 = subDays(startOfDay(now), 30);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Branches"
        description="Compare locations · tap a card to scope the whole dashboard"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {BRANCHES.map((branch) => {
          const revenue30 = invoicesForRange(data, branch.id, from30, now).reduce(
            (s, i) => s + i.total,
            0
          );
          const prevRevenue = invoicesForRange(
            data,
            branch.id,
            subDays(from30, 30),
            from30
          ).reduce((s, i) => s + i.total, 0);
          const growth =
            prevRevenue > 0 ? ((revenue30 - prevRevenue) / prevRevenue) * 100 : 0;
          const today = metricsForDay(data, branch.id, now);
          const staffCount = STAFF.filter((s) => s.branchId === branch.id).length;
          const reviews = reviewSummary(data, branch.id);
          const perf = staffPerformance(data, branch.id, from30, now);
          const avgUtil =
            perf.length > 0
              ? perf.reduce((s, p) => s + p.utilization, 0) / perf.length
              : 0;

          return (
            <div key={branch.id} className="rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-heading text-lg font-semibold">
                    {branch.name}
                    {branch.isPrimary && (
                      <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                        MAIN
                      </span>
                    )}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" aria-hidden />
                    {branch.address.line1}, {branch.address.city}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                  {reviews.overall || "—"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">Revenue (30d)</p>
                  <p className="font-heading text-lg font-semibold tabular-nums">
                    {inr(revenue30, { compact: true })}
                  </p>
                  <p
                    className={
                      growth >= 0 ? "text-xs text-success" : "text-xs text-destructive"
                    }
                  >
                    {growth >= 0 ? "+" : ""}
                    {growth.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Today</p>
                  <p className="font-heading text-lg font-semibold tabular-nums">
                    {inr(today.revenue, { compact: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {today.appointments} bookings
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Utilization</p>
                  <p className="font-heading text-lg font-semibold tabular-nums">
                    {percent(avgUtil)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3" aria-hidden />
                    {staffCount} staff
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <a
                  href={`tel:${branch.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Phone className="size-3" aria-hidden />
                  {branch.phone}
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOwnerBranchFilter(branch.id)}
                >
                  Focus dashboard
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
