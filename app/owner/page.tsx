"use client";

import Link from "next/link";
import { subDays, startOfDay } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/shared/metric-card";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { RevenueTrendChart } from "@/components/charts/revenue-trend";
import { BarList } from "@/components/charts/bar-list";
import { useDemoStore } from "@/lib/store";
import {
  businessInsights,
  customerById,
  customerSegments,
  lowStockItems,
  metricsForDay,
  queueForBranch,
  revenueTrend,
  servicePopularity,
  serviceNames,
  staffPerformance,
  branchById,
} from "@/lib/selectors";
import { BRANCHES } from "@/lib/data/seed-static";
import { inr, percent, timeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function OwnerDashboard() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);

  const now = new Date();
  const today = metricsForDay(data, branchFilter, now);
  const yesterday = metricsForDay(data, branchFilter, subDays(now, 1));
  const revDelta =
    yesterday.revenue > 0
      ? ((today.revenue - yesterday.revenue) / yesterday.revenue) * 100
      : 0;

  const trend = revenueTrend(data, branchFilter, 14, now);
  const from30 = subDays(startOfDay(now), 30);
  const staffPerf = staffPerformance(data, branchFilter, from30, now).slice(0, 5);
  const popular = servicePopularity(data, branchFilter, from30, now).slice(0, 5);
  const segments = customerSegments(data, branchFilter);
  const lowStock = lowStockItems(data, branchFilter);
  const insights = businessInsights(data, branchFilter, now);
  const pendingLeave = data.leaveRequests.filter(
    (l) =>
      l.status === "pending" &&
      (branchFilter === "all" || l.branchId === branchFilter)
  );

  // Live view: single-branch → that branch; all → primary branch snapshot
  const liveBranchId = branchFilter === "all" ? "br_kakkanad" : branchFilter;
  const queue = queueForBranch(data, liveBranchId, now);

  const upcoming = data.appointments
    .filter(
      (a) =>
        (branchFilter === "all" || a.branchId === branchFilter) &&
        a.status === "confirmed" &&
        new Date(a.start).getTime() > now.getTime() &&
        new Date(a.start).toDateString() === now.toDateString()
    )
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  // Repeat rate over 30 days
  const repeatRate =
    segments.all.length > 0
      ? segments.returning.length / segments.all.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
            Good {now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"}, Vikram
          </h1>
          <p className="text-sm text-muted-foreground">
            {branchFilter === "all"
              ? "All branches"
              : branchById(branchFilter)?.name}{" "}
            ·{" "}
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/owner/analytics">
            Full analytics
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>

      {/* Top metrics */}
      <section
        aria-label="Today's key metrics"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
      >
        <MetricCard
          label="Today revenue"
          value={today.revenue}
          format={(n) => inr(n)}
          delta={Math.round(revDelta * 10) / 10}
          deltaLabel="vs yesterday"
          className="col-span-2 md:col-span-1"
        />
        <MetricCard label="Appointments" value={today.appointments} />
        <MetricCard label="Walk-ins" value={today.walkIns} />
        <MetricCard label="Customers" value={today.customers} />
        <MetricCard
          label="Avg ticket"
          value={today.avgTicket}
          format={(n) => inr(n)}
        />
        <MetricCard
          label="No-show rate"
          value={Math.round(today.noShowRate * 1000) / 10}
          format={(n) => `${n}%`}
          hint={`Repeat rate ${percent(repeatRate)}`}
        />
      </section>

      {/* Alerts / opportunities */}
      {insights.length > 0 && (
        <section aria-label="Alerts and opportunities">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <Lightbulb className="size-3.5 text-warning" aria-hidden />
            Needs your attention
          </h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0">
            {insights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  "min-w-72 shrink-0 rounded-2xl border bg-card p-4 lg:min-w-0",
                  insight.kind === "risk" && "border-destructive/30",
                  insight.kind === "opportunity" && "border-success/30"
                )}
              >
                <p className="flex items-start gap-2 text-sm font-semibold">
                  {insight.kind === "risk" ? (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                  ) : insight.kind === "opportunity" ? (
                    <TrendingUp className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  ) : (
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
                  )}
                  {insight.title}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">{insight.detail}</p>
                {insight.actionHref && (
                  <Link
                    href={insight.actionHref as "/"}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {insight.actionLabel}
                    <ArrowRight className="size-3" aria-hidden />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Revenue trend */}
        <section
          aria-label="Revenue trend"
          className="rounded-2xl border bg-card p-4 xl:col-span-2"
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Revenue · last 14 days</h2>
            <p className="text-xs text-muted-foreground">
              Total {inr(trend.reduce((s, d) => s + d.revenue, 0), { compact: true })}
            </p>
          </div>
          <RevenueTrendChart data={trend} className="mt-3 h-52 w-full md:h-64" />
        </section>

        {/* Live shop */}
        <section aria-label="Live shop" className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <span className="size-2 animate-pulse rounded-full bg-success" aria-hidden />
              Live · {branchById(liveBranchId)?.name}
            </h2>
            <Link
              href="/owner/queue"
              className="text-xs font-medium text-primary hover:underline"
            >
              Queue ({queue.waiting.length})
            </Link>
          </div>
          <ul className="mt-3 grid gap-2.5">
            {queue.staffState.map(({ staff, state, current, remainingMin }) => (
              <li key={staff.id} className="flex items-center gap-2.5">
                <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{staff.name}</p>
                  {current && (
                    <p className="truncate text-xs text-muted-foreground">
                      {customerById(data, current.customerId)?.name} ·{" "}
                      {serviceNames(current.serviceIds)}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    state === "serving" && "bg-success/10 text-success",
                    state === "free" && "bg-info/10 text-info",
                    state === "break" && "bg-warning/15 text-warning-foreground dark:text-warning",
                    (state === "off" || state === "leave") && "bg-muted text-muted-foreground"
                  )}
                >
                  {state === "serving"
                    ? `${remainingMin}m left`
                    : state === "free"
                      ? "Available"
                      : state === "break"
                        ? "Break"
                        : state === "leave"
                          ? "Leave"
                          : "Off"}
                </span>
              </li>
            ))}
          </ul>
          {upcoming.length > 0 && (
            <>
              <h3 className="mt-4 border-t pt-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Up next today
              </h3>
              <ul className="mt-2 grid gap-1.5">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-xs">
                    <span className="w-14 shrink-0 font-medium tabular-nums">
                      {timeLabel(a.start)}
                    </span>
                    <span className="truncate text-muted-foreground">
                      {customerById(data, a.customerId)?.name} ·{" "}
                      {serviceNames(a.serviceIds)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Staff performance */}
        <section aria-label="Staff performance" className="rounded-2xl border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Staff · 30 days</h2>
            <Link href="/owner/staff" className="text-xs font-medium text-primary hover:underline">
              All staff
            </Link>
          </div>
          <BarList
            className="mt-4"
            items={staffPerf.map((p) => ({
              label: p.staff.name,
              value: p.revenue,
              hint: `${p.services} services`,
            }))}
            formatValue={(v) => inr(v, { compact: true })}
          />
        </section>

        {/* Popular services */}
        <section aria-label="Popular services" className="rounded-2xl border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Services · 30 days</h2>
            <Link href="/owner/services" className="text-xs font-medium text-primary hover:underline">
              Catalog
            </Link>
          </div>
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

        {/* Customers + stock + staff requests */}
        <div className="grid gap-6">
          <section aria-label="Customer insights" className="rounded-2xl border bg-card p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">Customers</h2>
              <Link href="/owner/customers" className="text-xs font-medium text-primary hover:underline">
                CRM
              </Link>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              {[
                { label: "New (30d)", value: segments.newCustomers.length },
                { label: "Returning", value: segments.returning.length },
                { label: "Inactive 60d+", value: segments.inactive60.length },
                { label: "VIP", value: segments.vip.length },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-muted/50 p-3">
                  <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                  <dd className="font-heading text-lg font-semibold tabular-nums">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-label="Low stock" className="rounded-2xl border bg-card p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Package className="size-4 text-muted-foreground" aria-hidden />
                Low stock ({lowStock.length})
              </h2>
              <Link href="/owner/inventory" className="text-xs font-medium text-primary hover:underline">
                Inventory
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                All items above minimum levels.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {lowStock.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <span className="min-w-0">
                      <span className="font-medium">{item.name}</span>
                      {branchFilter === "all" && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {branchById(item.branchId)?.name}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                      {item.quantity} {item.unit} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {pendingLeave.length > 0 && (
              <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                Also: <strong>{pendingLeave.length} leave request{pendingLeave.length > 1 ? "s" : ""}</strong> awaiting
                approval —{" "}
                <Link href="/manager/leave" className="font-medium text-primary hover:underline">
                  review
                </Link>
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Branch strip (all-branch view) */}
      {branchFilter === "all" && (
        <section aria-label="Branch comparison">
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Branches today
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {BRANCHES.map((branch) => {
              const m = metricsForDay(data, branch.id, now);
              return (
                <Link
                  key={branch.id}
                  href="/owner/branches"
                  className="rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-semibold">{branch.name}</p>
                  <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
                    {inr(m.revenue, { compact: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.appointments} bookings · {m.walkIns} walk-ins
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
