"use client";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { BarList } from "@/components/charts/bar-list";
import { useDemoStore } from "@/lib/store";
import { platformMetrics } from "@/lib/admin-data";
import { shopName } from "@/lib/shop-name";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AdminSubscriptionsPage() {
  const data = useDemoStore((s) => s.data);
  const m = platformMetrics(data);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Subscriptions" description="Plans, MRR and lifecycle (simulated)" />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard compact label="MRR" value={m.mrr} format={(n) => inr(n)} />
        <MetricCard compact label="Active" value={m.active.length} />
        <MetricCard compact label="Trials" value={m.trial.length} />
        <MetricCard compact label="Churned" value={m.churned.length} />
      </section>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">MRR by plan</h2>
        <BarList
          className="mt-4"
          items={m.planDistribution
            .map((p) => ({
              label: p.plan.name,
              value: m.shops
                .filter((s) => s.plan === p.plan.id)
                .reduce((s, shop) => s + shop.mrr, 0),
              hint: `${p.count} shops`,
            }))
            .sort((a, b) => b.value - a.value)}
          formatValue={(v) => inr(v)}
        />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Needs attention
        </h2>
        <ul className="grid gap-2">
          {m.shops
            .filter((s) => s.status === "past-due" || s.status === "trial")
            .map((shop) => (
              <li
                key={shop.id}
                className="flex items-center gap-3 rounded-2xl border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{shopName(shop)}</p>
                  <p className="text-xs text-muted-foreground">
                    {shop.status === "past-due"
                      ? "Payment failed — card expired. Retry scheduled."
                      : "Trial in progress — nudge to convert with onboarding call."}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
                    shop.status === "past-due"
                      ? "bg-warning/15 text-warning-foreground dark:text-warning"
                      : "bg-info/10 text-info"
                  )}
                >
                  {shop.status}
                </span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
