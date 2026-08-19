"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { differenceInDays, subDays, startOfDay } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueTrendChart } from "@/components/charts/revenue-trend";
import { HourlyLoadChart } from "@/components/charts/hourly-load";
import { BarList } from "@/components/charts/bar-list";
import { StaffPerformanceList } from "@/components/staff/staff-performance-list";
import { useDemoStore } from "@/lib/store";
import {
  businessInsights,
  customerSegments,
  dailyLoad,
  hourlyLoad,
  invoicesForRange,
  revenueTrend,
  servicePopularity,
  staffPerformance,
} from "@/lib/selectors";
import { BRANCHES } from "@/lib/data/seed-static";
import { inr, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

const TABS = ["revenue", "customers", "bookings", "staff", "services", "time", "insights"] as const;
type Tab = (typeof TABS)[number];

function AnalyticsInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "revenue";
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab) ? initialTab : "revenue");

  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const now = useMemo(() => new Date(), []);
  const from30 = useMemo(() => subDays(startOfDay(now), 30), [now]);

  const derived = useMemo(() => {
    const invoices = invoicesForRange(data, branchFilter, from30, now);
    const revenue = invoices.reduce((s, i) => s + i.total, 0);
    const trend = revenueTrend(data, branchFilter, 30, now);
    const segments = customerSegments(data, branchFilter);
    const perf = staffPerformance(data, branchFilter, from30, now);
    const popular = servicePopularity(data, branchFilter, from30, now);
    const hourly = hourlyLoad(data, branchFilter, now);
    const daily = dailyLoad(data, branchFilter, now);
    const insights = businessInsights(data, branchFilter, now);

    const appts30 = data.appointments.filter((a) => {
      const t = new Date(a.start).getTime();
      return (
        (branchFilter === "all" || a.branchId === branchFilter) &&
        t >= from30.getTime() &&
        t <= now.getTime()
      );
    });
    const online = appts30.filter((a) => a.source === "online").length;
    const walkIn = appts30.filter((a) => a.source === "walk-in").length;
    const cancelled = appts30.filter((a) => a.status === "cancelled").length;
    const noShow = appts30.filter((a) => a.status === "no-show").length;

    const leadTimes = appts30
      .filter((a) => a.source === "online")
      .map((a) =>
        Math.max(
          0,
          (new Date(a.start).getTime() - new Date(a.createdAt).getTime()) / 36e5
        )
      );
    const avgLead =
      leadTimes.length > 0
        ? leadTimes.reduce((s, v) => s + v, 0) / leadTimes.length
        : 0;

    // LTV & frequency
    const spenders = segments.all.filter((s) => s.visits > 0);
    const avgLtv =
      spenders.length > 0
        ? spenders.reduce((s, c) => s + c.lifetimeSpend, 0) / spenders.length
        : 0;
    const freqDays = spenders
      .filter((s) => s.visits >= 2)
      .map((s) => {
        const days = differenceInDays(now, new Date(s.customer.joinedAt));
        return days / s.visits;
      });
    const avgFreq =
      freqDays.length > 0
        ? freqDays.reduce((s, v) => s + v, 0) / freqDays.length
        : 0;

    return {
      invoices,
      revenue,
      trend,
      segments,
      perf,
      popular,
      hourly,
      daily,
      insights,
      appts30: appts30.length,
      online,
      walkIn,
      cancelled,
      noShow,
      avgLead,
      avgLtv,
      avgFreq,
    };
  }, [data, branchFilter, from30, now]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader title="Analytics" description="Last 30 days" />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <div className="-mx-4 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:px-0">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="insights">
              <Sparkles className="size-3.5" aria-hidden />
              Insights
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {tab === "revenue" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard compact label="Revenue (30d)" value={derived.revenue} format={(n) => inr(n, { compact: true })} />
            <MetricCard compact label="Transactions" value={derived.invoices.length} />
            <MetricCard
              compact
              label="Avg ticket"
              value={derived.invoices.length ? Math.round(derived.revenue / derived.invoices.length) : 0}
              format={(n) => inr(n)}
            />
            <MetricCard
              compact
              label="Daily average"
              value={Math.round(derived.revenue / 30)}
              format={(n) => inr(n, { compact: true })}
            />
          </div>
          <section className="rounded-2xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Daily revenue</h2>
            <RevenueTrendChart data={derived.trend} className="mt-3 h-56 w-full md:h-72" />
          </section>
          {branchFilter === "all" && (
            <section className="rounded-2xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Branch comparison (30d)</h2>
              <BarList
                className="mt-4"
                items={BRANCHES.map((b) => ({
                  label: b.name,
                  value: invoicesForRange(data, b.id, from30, now).reduce(
                    (s, i) => s + i.total,
                    0
                  ),
                })).sort((a, b) => b.value - a.value)}
                formatValue={(v) => inr(v, { compact: true })}
              />
            </section>
          )}
        </div>
      )}

      {tab === "customers" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard compact label="Total customers" value={derived.segments.all.length} />
            <MetricCard compact label="New (30d)" value={derived.segments.newCustomers.length} />
            <MetricCard
              compact
              label="Repeat rate"
              value={Math.round(
                (derived.segments.returning.length /
                  Math.max(1, derived.segments.all.length)) *
                  100
              )}
              format={(n) => `${n}%`}
            />
            <MetricCard compact label="Inactive 60d+" value={derived.segments.inactive60.length} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Segments</h2>
              <BarList
                className="mt-4"
                color="var(--chart-3)"
                items={[
                  { label: "Returning", value: derived.segments.returning.length },
                  { label: "New (30d)", value: derived.segments.newCustomers.length },
                  { label: "VIP", value: derived.segments.vip.length },
                  { label: "Inactive 30d+", value: derived.segments.inactive30.length },
                  { label: "Inactive 60d+", value: derived.segments.inactive60.length },
                ]}
                formatValue={(v) => String(v)}
              />
            </section>
            <section className="rounded-2xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Value & frequency</h2>
              <dl className="mt-4 grid gap-3">
                <div className="rounded-xl bg-muted/50 p-3">
                  <dt className="text-xs text-muted-foreground">Average lifetime value</dt>
                  <dd className="font-heading text-xl font-semibold">{inr(Math.round(derived.avgLtv))}</dd>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <dt className="text-xs text-muted-foreground">Average visit frequency</dt>
                  <dd className="font-heading text-xl font-semibold">
                    every {Math.round(derived.avgFreq)} days
                  </dd>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <dt className="text-xs text-muted-foreground">Win-back opportunity</dt>
                  <dd className="text-sm">
                    <strong>{derived.segments.inactive60.length} customers</strong>{" "}
                    haven&apos;t visited in 60+ days —{" "}
                    <Link href="/owner/marketing" className="font-medium text-primary hover:underline">
                      start a campaign
                    </Link>
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard compact label="Bookings (30d)" value={derived.appts30} />
            <MetricCard
              compact
              label="Online vs walk-in"
              value={derived.online}
              format={(n) => `${n} / ${derived.walkIn}`}
            />
            <MetricCard
              compact
              label="Cancellation rate"
              value={Math.round((derived.cancelled / Math.max(1, derived.appts30)) * 100)}
              format={(n) => `${n}%`}
            />
            <MetricCard
              compact
              label="No-show rate"
              value={Math.round((derived.noShow / Math.max(1, derived.appts30)) * 100)}
              format={(n) => `${n}%`}
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Source mix</h2>
              <BarList
                className="mt-4"
                color="var(--chart-2)"
                items={[
                  { label: "Online bookings", value: derived.online },
                  { label: "Walk-ins", value: derived.walkIn },
                ]}
                formatValue={(v) =>
                  `${v} (${percent(v / Math.max(1, derived.online + derived.walkIn))})`
                }
              />
              <p className="mt-4 text-xs text-muted-foreground">
                Average booking lead time:{" "}
                <strong className="text-foreground">
                  {derived.avgLead < 24
                    ? `${Math.round(derived.avgLead)} hours`
                    : `${(derived.avgLead / 24).toFixed(1)} days`}
                </strong>
              </p>
            </section>
            <section className="rounded-2xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Outcomes (30d)</h2>
              <BarList
                className="mt-4"
                color="var(--chart-4)"
                items={[
                  {
                    label: "Completed",
                    value:
                      derived.appts30 - derived.cancelled - derived.noShow,
                  },
                  { label: "Cancelled", value: derived.cancelled },
                  { label: "No-shows", value: derived.noShow },
                ]}
                formatValue={(v) => String(v)}
              />
            </section>
          </div>
        </div>
      )}

      {tab === "staff" && (
        <div className="space-y-5">
          <StaffPerformanceList performance={derived.perf} linkBase="/owner/staff" />
        </div>
      )}

      {tab === "services" && (
        <div className="space-y-5">
          <section className="rounded-2xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Revenue by service (30d)</h2>
            <BarList
              className="mt-4"
              color="var(--chart-2)"
              items={derived.popular.map((p) => ({
                label: p.service!.name,
                value: p.revenue,
                hint: `${p.bookings} bookings`,
              }))}
              formatValue={(v) => inr(v, { compact: true })}
            />
          </section>
          <section className="rounded-2xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Average order value per service</h2>
            <BarList
              className="mt-4"
              color="var(--chart-4)"
              items={derived.popular
                .map((p) => ({
                  label: p.service!.name,
                  value: Math.round(p.revenue / Math.max(1, p.bookings)),
                }))
                .sort((a, b) => b.value - a.value)}
              formatValue={(v) => inr(v)}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Hair Colour typically leads AOV — promote colour consultations to
              repeat haircut customers.
            </p>
          </section>
        </div>
      )}

      {tab === "time" && (
        <div className="space-y-5">
          <section className="rounded-2xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Bookings by hour · last 3 weeks</h2>
            <HourlyLoadChart data={derived.hourly} className="mt-3 h-52 w-full" />
          </section>
          <section className="rounded-2xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Bookings by day of week</h2>
            <BarList
              className="mt-4"
              color="var(--chart-3)"
              items={derived.daily.map((d) => ({ label: d.dow, value: d.count }))}
              formatValue={(v) => String(v)}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Weekend evenings run hottest; Tuesday mornings are your best
              off-peak promotion window.
            </p>
          </section>
        </div>
      )}

      {tab === "insights" && (
        <div className="grid gap-3 md:grid-cols-2">
          {derived.insights.map((insight) => (
            <div
              key={insight.id}
              className={cn(
                "rounded-2xl border bg-card p-5",
                insight.kind === "risk" && "border-destructive/30",
                insight.kind === "opportunity" && "border-success/30"
              )}
            >
              <p className="flex items-start gap-2.5 text-sm font-semibold">
                {insight.kind === "risk" ? (
                  <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-destructive" aria-hidden />
                ) : insight.kind === "opportunity" ? (
                  <TrendingUp className="mt-0.5 size-4.5 shrink-0 text-success" aria-hidden />
                ) : (
                  <Lightbulb className="mt-0.5 size-4.5 shrink-0 text-info" aria-hidden />
                )}
                {insight.title}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{insight.detail}</p>
              {insight.actionHref && (
                <Link
                  href={insight.actionHref as "/"}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {insight.actionLabel}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground md:col-span-2">
            Insights are generated deterministically from your live demo data —
            no external AI involved.
          </p>
        </div>
      )}
    </div>
  );
}

export default function OwnerAnalyticsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AnalyticsInner />
    </Suspense>
  );
}
