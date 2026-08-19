"use client";

import { subMonths, format } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueTrendChart } from "@/components/charts/revenue-trend";
import { BarList } from "@/components/charts/bar-list";
import { useDemoStore } from "@/lib/store";
import { platformMetrics } from "@/lib/admin-data";
import { inr, percent } from "@/lib/format";

export default function AdminAnalyticsPage() {
  const data = useDemoStore((s) => s.data);
  const m = platformMetrics(data);

  const mrrTrend = Array.from({ length: 8 }, (_, i) => {
    const d = subMonths(new Date(), 7 - i);
    return {
      label: format(d, "MMM"),
      revenue: Math.round(m.mrr * (0.55 + i * 0.065)),
    };
  });

  const cityMix = [
    { label: "Kochi", value: m.shops.filter((s) => s.city === "Kochi").length },
    { label: "Kozhikode", value: m.shops.filter((s) => s.city === "Kozhikode").length },
    { label: "Thiruvananthapuram", value: m.shops.filter((s) => s.city === "Thiruvananthapuram").length },
    { label: "Thrissur", value: m.shops.filter((s) => s.city === "Thrissur").length },
    { label: "Kollam", value: m.shops.filter((s) => s.city === "Kollam").length },
  ].filter((c) => c.value > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Platform analytics" description="Simulated growth metrics" />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard compact label="MRR" value={m.mrr} format={(n) => inr(n)} />
        <MetricCard compact label="ARR run-rate" value={m.mrr * 12} format={(n) => inr(n, { compact: true })} />
        <MetricCard
          compact
          label="Trial → paid"
          value={62}
          format={(n) => `${n}%`}
        />
        <MetricCard
          compact
          label="Churn"
          value={Math.round(m.churnRate * 1000) / 10}
          format={(n) => `${n}%`}
        />
      </section>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">MRR growth · 8 months</h2>
        <RevenueTrendChart data={mrrTrend} className="mt-3 h-52 w-full" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Shops by city</h2>
          <BarList
            className="mt-4"
            color="var(--chart-3)"
            items={cityMix}
            formatValue={(v) => `${v} (${percent(v / m.shops.length)})`}
          />
        </section>
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Usage highlights</h2>
          <dl className="mt-4 grid gap-3">
            <div className="rounded-xl bg-muted/50 p-3">
              <dt className="text-xs text-muted-foreground">Bookings processed (lifetime)</dt>
              <dd className="font-heading text-xl font-semibold tabular-nums">
                {m.bookingsProcessed.toLocaleString("en-IN")}
              </dd>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <dt className="text-xs text-muted-foreground">Payment volume (lifetime)</dt>
              <dd className="font-heading text-xl font-semibold tabular-nums">
                {inr(m.paymentVolume, { compact: true })}
              </dd>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <dt className="text-xs text-muted-foreground">End customers on platform</dt>
              <dd className="font-heading text-xl font-semibold tabular-nums">
                {m.activeCustomers.toLocaleString("en-IN")}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
