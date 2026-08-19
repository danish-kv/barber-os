"use client";

import Link from "next/link";
import { ArrowRight, LifeBuoy, Store, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { BarList } from "@/components/charts/bar-list";
import { useDemoStore } from "@/lib/store";
import { platformMetrics } from "@/lib/admin-data";
import { inr, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const data = useDemoStore((s) => s.data);
  const m = platformMetrics(data);

  const newShops = [...m.shops]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 4);
  const topShops = [...m.shops].sort((a, b) => b.mrr - a.mrr).slice(0, 5);
  const openTickets = data.supportTickets.filter((t) => t.status !== "resolved");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Platform overview"
        description="Barbershop OS · all tenants (simulated data)"
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Total businesses" value={m.shops.length} />
        <MetricCard label="Active subscriptions" value={m.active.length} hint={`${m.trial.length} in trial`} />
        <MetricCard label="MRR" value={m.mrr} format={(n) => inr(n)} delta={6.2} deltaLabel="vs last month" />
        <MetricCard
          label="Churn"
          value={Math.round(m.churnRate * 1000) / 10}
          format={(n) => `${n}%`}
        />
      </section>

      <section className="grid grid-cols-3 gap-3">
        <MetricCard compact label="Bookings processed" value={m.bookingsProcessed} />
        <MetricCard
          compact
          label="Payment volume"
          value={m.paymentVolume}
          format={(n) => inr(n, { compact: true })}
        />
        <MetricCard compact label="End customers" value={m.activeCustomers} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan distribution */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Plan distribution</h2>
          <BarList
            className="mt-4"
            items={m.planDistribution.map((p) => ({
              label: p.plan.name,
              value: p.count,
              hint: p.plan.pricePerMonth ? `${inr(p.plan.pricePerMonth)}/mo` : "free",
            }))}
            formatValue={(v) => `${v} shops`}
          />
        </section>

        {/* Top shops */}
        <section className="rounded-2xl border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Top shops by MRR</h2>
            <Link href="/admin/shops" className="text-xs font-medium text-primary hover:underline">
              All shops
            </Link>
          </div>
          <ul className="mt-3 grid gap-2.5">
            {topShops.map((shop) => (
              <li key={shop.id} className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Store className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/shops/${shop.id}` as "/"}
                    className="text-sm font-medium hover:underline"
                  >
                    {shop.businessId === "biz_royalcuts" ? "Royal Cuts" : shop.id.replace("shop_", "").replace(/^\w/, (c) => c.toUpperCase())}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {shop.city} · {shop.branchCount} branch{shop.branchCount > 1 ? "es" : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{inr(shop.mrr)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Support + new shops */}
        <div className="grid gap-6">
          <section className="rounded-2xl border bg-card p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <LifeBuoy className="size-4 text-muted-foreground" aria-hidden />
                Support ({openTickets.length} open)
              </h2>
              <Link href="/admin/support" className="text-xs font-medium text-primary hover:underline">
                Inbox
              </Link>
            </div>
            <ul className="mt-3 grid gap-2">
              {openTickets.slice(0, 3).map((t) => (
                <li key={t.id} className="text-sm">
                  <p className="line-clamp-1 font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "mr-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                        t.priority === "high" && "bg-destructive/10 text-destructive",
                        t.priority === "medium" && "bg-warning/15 text-warning-foreground dark:text-warning",
                        t.priority === "low" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {t.priority}
                    </span>
                    {relativeTime(t.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
              Newest shops
            </h2>
            <ul className="mt-3 grid gap-2">
              {newShops.map((shop) => (
                <li key={shop.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {shop.businessId === "biz_royalcuts"
                      ? "Royal Cuts"
                      : shop.id.replace("shop_", "").replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      shop.status === "trial" && "bg-info/10 text-info",
                      shop.status === "active" && "bg-success/10 text-success",
                      shop.status === "past-due" && "bg-warning/15 text-warning-foreground dark:text-warning",
                      shop.status === "churned" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {shop.status}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/shops"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all shops
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </section>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Platform data is simulated. Royal Cuts reflects the live demo state; other
        tenants are static examples. No real payments exist.
      </p>
    </div>
  );
}
