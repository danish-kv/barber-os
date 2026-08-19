"use client";

import { useMemo } from "react";
import { startOfMonth, subDays, startOfDay } from "date-fns";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueTrendChart } from "@/components/charts/revenue-trend";
import { BarList } from "@/components/charts/bar-list";
import { useDemoStore } from "@/lib/store";
import { commissionForInvoice } from "@/lib/selectors";
import { SERVICES } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";

const STAFF_ID = "st_akhil";

export default function StaffEarningsPage() {
  const data = useDemoStore((s) => s.data);
  const now = new Date();
  const monthStart = startOfMonth(now);

  const { todayStats, monthStats, trend, byService } = useMemo(() => {
    const myInvoices = data.invoices.filter((inv) =>
      inv.lineItems.some((li) => li.staffId === STAFF_ID)
    );

    const calc = (from: Date, to: Date) => {
      let revenue = 0;
      let commission = 0;
      let services = 0;
      for (const inv of myInvoices) {
        const t = new Date(inv.createdAt).getTime();
        if (t < from.getTime() || t > to.getTime()) continue;
        const mine = inv.lineItems.filter((li) => li.staffId === STAFF_ID);
        revenue += mine.reduce((s, li) => s + li.price * li.qty, 0);
        commission += commissionForInvoice(inv, STAFF_ID);
        services += mine.filter((li) => li.kind === "service").length;
      }
      return { revenue, commission, services };
    };

    const dayTrend: Array<{ label: string; revenue: number }> = [];
    for (let d = 13; d >= 0; d--) {
      const day = subDays(startOfDay(now), d);
      const end = new Date(day.getTime() + 24 * 3600_000 - 1);
      dayTrend.push({
        label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue: calc(day, end).commission,
      });
    }

    const svcMap = new Map<string, number>();
    for (const inv of myInvoices) {
      const t = new Date(inv.createdAt).getTime();
      if (t < monthStart.getTime()) continue;
      for (const li of inv.lineItems) {
        if (li.staffId !== STAFF_ID || li.kind !== "service") continue;
        svcMap.set(li.refId, (svcMap.get(li.refId) ?? 0) + li.price * li.qty);
      }
    }
    const byService = [...svcMap.entries()]
      .map(([id, revenue]) => ({
        label: SERVICES.find((s) => s.id === id)?.name ?? id,
        value: revenue,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      todayStats: calc(startOfDay(now), now),
      monthStats: calc(monthStart, now),
      trend: dayTrend,
      byService,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.invoices]);

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Earnings</h1>

      <section className="grid grid-cols-3 gap-2">
        <MetricCard compact label="Today" value={todayStats.commission} format={(n) => inr(n, { compact: true })} />
        <MetricCard compact label="This month" value={monthStats.commission} format={(n) => inr(n, { compact: true })} />
        <MetricCard compact label="Services (month)" value={monthStats.services} />
      </section>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Commission · last 14 days</h2>
        <RevenueTrendChart data={trend} className="mt-3 h-44 w-full" />
      </section>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Your revenue by service · this month</h2>
        <BarList
          className="mt-4"
          items={byService}
          formatValue={(v) => inr(v, { compact: true })}
        />
      </section>

      <p className="text-xs text-muted-foreground">
        Commission updates live as your services are checked out at the POS.
        Detailed rates are on the{" "}
        <a href="/staff/commissions" className="font-medium text-primary hover:underline">
          commissions page
        </a>
        .
      </p>
    </div>
  );
}
