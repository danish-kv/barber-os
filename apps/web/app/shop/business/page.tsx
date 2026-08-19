"use client";

// Simple business summary — a solo/small owner's "how are we doing?" screen.
// Deliberately not the enterprise owner dashboard.

import { subDays, startOfDay } from "date-fns";
import Link from "next/link";
import { ChevronRight, Receipt, Settings } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { BarList } from "@/components/charts/bar-list";
import { RevenueTrendChart } from "@/components/charts/revenue-trend";
import { StaffPerformanceList } from "@/components/staff/staff-performance-list";
import { useDemoStore } from "@/lib/store";
import {
  expenseSummary,
  metricsForDay,
  revenueTrend,
  servicePopularity,
  staffPerformance,
  staffForBranch,
} from "@/lib/selectors";
import { inr } from "@/lib/format";

export default function ShopBusinessPage() {
  const data = useDemoStore((s) => s.data);
  const now = new Date();
  const branchId = data.branchId;

  const today = metricsForDay(data, branchId, now);
  const trend = revenueTrend(data, branchId, 14, now);
  const weekRevenue = trend.slice(-7).reduce((s, d) => s + d.revenue, 0);
  const popular = servicePopularity(data, branchId, subDays(startOfDay(now), 30), now).slice(0, 5);
  const roster = staffForBranch(data, branchId, { includeInactive: true });
  const solo = roster.length <= 1;
  const perf = staffPerformance(data, branchId, subDays(now, 30), now);
  const { total: expenses } = expenseSummary(
    data,
    branchId,
    subDays(startOfDay(now), 30),
    now
  );

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Business</h1>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Today" value={today.revenue} format={(n) => inr(n)} />
        <MetricCard label="Last 7 days" value={weekRevenue} format={(n) => inr(n, { compact: true })} />
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Revenue · last 14 days</h2>
        <RevenueTrendChart data={trend} className="mt-3 h-44 w-full" />
      </section>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Top services · 30 days</h2>
        <BarList
          className="mt-4"
          color="var(--chart-2)"
          items={popular.map((p) => ({
            label: p.service!.name,
            value: p.revenue,
            hint: `${p.bookings}×`,
          }))}
          formatValue={(v) => inr(v, { compact: true })}
        />
      </section>

      {!solo && (
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Staff · 30 days
          </h2>
          <StaffPerformanceList performance={perf} />
        </section>
      )}

      <section className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Receipt className="size-5 text-muted-foreground" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Expenses · 30 days</p>
            <p className="text-xs text-muted-foreground">
              Rent, electricity and supplies
            </p>
          </div>
          <span className="font-heading font-semibold tabular-nums">
            {inr(expenses, { compact: true })}
          </span>
        </div>
      </section>

      <Link
        href="/shop/settings"
        className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <Settings className="size-5 text-muted-foreground" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">How this shop operates</p>
          <p className="text-xs text-muted-foreground">
            Booking style, staff selection, payments
          </p>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
      </Link>
    </div>
  );
}
