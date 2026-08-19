"use client";

import { subDays } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { BarList } from "@/components/charts/bar-list";
import { HourlyLoadChart } from "@/components/charts/hourly-load";
import { StaffPerformanceList } from "@/components/staff/staff-performance-list";
import { useDemoStore } from "@/lib/store";
import {
  hourlyLoad,
  invoicesForRange,
  servicePopularity,
  staffPerformance,
} from "@/lib/selectors";
import { inr } from "@/lib/format";

const BRANCH_ID = "br_kakkanad";

export default function ManagerPerformancePage() {
  const data = useDemoStore((s) => s.data);
  const now = new Date();
  const from = subDays(now, 30);

  const perf = staffPerformance(data, BRANCH_ID, from, now);
  const popular = servicePopularity(data, BRANCH_ID, from, now).slice(0, 6);
  const invoices = invoicesForRange(data, BRANCH_ID, from, now);
  const revenue = invoices.reduce((s, i) => s + i.total, 0);
  const hourly = hourlyLoad(data, BRANCH_ID, now);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Performance" description="Kakkanad · last 30 days" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard compact label="Revenue (30d)" value={revenue} format={(n) => inr(n, { compact: true })} />
        <MetricCard compact label="Transactions" value={invoices.length} />
        <MetricCard
          compact
          label="Avg ticket"
          value={invoices.length ? Math.round(revenue / invoices.length) : 0}
          format={(n) => inr(n)}
        />
        <MetricCard
          compact
          label="Top performer"
          value={perf[0]?.revenue ?? 0}
          format={() => perf[0]?.staff.name ?? "—"}
        />
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Busiest hours · last 3 weeks</h2>
        <HourlyLoadChart data={hourly} className="mt-3 h-44 w-full" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Service revenue</h2>
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
        <section>
          <h2 className="mb-3 text-sm font-semibold">Staff breakdown</h2>
          <StaffPerformanceList performance={perf} />
        </section>
      </div>
    </div>
  );
}
