"use client";

import { subMonths, format } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueTrendChart } from "@/components/charts/revenue-trend";
import { useDemoStore } from "@/lib/store";
import { platformMetrics } from "@/lib/admin-data";
import { shopName } from "@/lib/shop-name";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const data = useDemoStore((s) => s.data);
  const m = platformMetrics(data);

  // Simulated 6-month subscription revenue trend.
  const trend = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return {
      label: format(d, "MMM"),
      revenue: Math.round(m.mrr * (0.72 + i * 0.055)),
    };
  });

  const recent = m.shops
    .filter((s) => s.mrr > 0)
    .map((shop, i) => ({
      shop,
      date: subMonths(new Date(), 0),
      ok: shop.status !== "past-due",
      id: `PAY-${8200 + i}`,
    }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Payments"
        description="Subscription billing across tenants (simulated — no real payments exist)"
      />

      <section className="grid grid-cols-3 gap-3">
        <MetricCard compact label="MRR" value={m.mrr} format={(n) => inr(n)} />
        <MetricCard
          compact
          label="Collected this month"
          value={m.shops.filter((s) => s.status === "active").reduce((s, x) => s + x.mrr, 0)}
          format={(n) => inr(n)}
        />
        <MetricCard
          compact
          label="Failed payments"
          value={m.shops.filter((s) => s.status === "past-due").length}
        />
      </section>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Subscription revenue · 6 months</h2>
        <RevenueTrendChart data={trend} className="mt-3 h-48 w-full" />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          This month&apos;s charges
        </h2>
        <ul className="grid gap-1.5">
          {recent.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{shopName(r.shop)}</p>
                <p className="text-xs text-muted-foreground">
                  {r.id} · {r.shop.plan.replace("-", " ")} plan
                </p>
              </div>
              <span className="font-medium tabular-nums">{inr(r.shop.mrr)}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  r.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}
              >
                {r.ok ? "Paid" : "Failed"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
