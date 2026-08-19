"use client";

import { use } from "react";
import Link from "next/link";
import { subDays, startOfMonth } from "date-fns";
import { ArrowLeft, UserRoundX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/shared/metric-card";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { EmptyState } from "@/components/shared/empty-state";
import { BarList } from "@/components/charts/bar-list";
import { useDemoStore } from "@/lib/store";
import { commissionForInvoice, staffPerformance } from "@/lib/selectors";
import { STAFF, SERVICES } from "@/lib/data/seed-static";
import { inr, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORY_LABEL: Record<string, string> = {
  hair: "Hair", beard: "Beard", color: "Colour", spa: "Spa",
  kids: "Kids", product: "Products", default: "Other",
};

export default function OwnerStaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const data = useDemoStore((s) => s.data);
  const staff = STAFF.find((s) => s.id === id);

  if (!staff) {
    return (
      <EmptyState
        icon={UserRoundX}
        title="Staff member not found"
        actionLabel="Back to staff"
        actionHref="/owner/staff"
      />
    );
  }

  const now = new Date();
  const perf = staffPerformance(data, staff.branchId, subDays(now, 30), now).find(
    (p) => p.staff.id === staff.id
  );

  const monthStart = startOfMonth(now);
  let monthServiceRevenue = 0;
  let monthProductRevenue = 0;
  let monthCommission = 0;
  const svcRevenue = new Map<string, number>();
  for (const inv of data.invoices) {
    if (new Date(inv.createdAt).getTime() < monthStart.getTime()) continue;
    const mine = inv.lineItems.filter((li) => li.staffId === staff.id);
    if (mine.length === 0) continue;
    monthCommission += commissionForInvoice(inv, staff.id);
    for (const li of mine) {
      const amt = li.price * li.qty;
      if (li.kind === "product") monthProductRevenue += amt;
      else {
        monthServiceRevenue += amt;
        svcRevenue.set(li.refId, (svcRevenue.get(li.refId) ?? 0) + amt);
      }
    }
  }

  const leaves = data.leaveRequests.filter((l) => l.staffId === staff.id);
  const reviews = data.reviews
    .filter((r) => r.staffId === staff.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="-ml-2 size-9" asChild>
          <Link href="/owner/staff" aria-label="Back to staff">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="font-heading text-xl font-semibold">Staff profile</h1>
      </div>

      <section className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="xl" />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold">{staff.name}</p>
          <p className="text-sm text-muted-foreground">
            {staff.title} · {staff.experienceYears} yrs · joined{" "}
            {new Date(staff.joinedAt).getFullYear()}
          </p>
          <p className="mt-1 flex items-center gap-1.5">
            <StarRating rating={staff.rating} size="sm" />
            <span className="text-xs text-muted-foreground">({staff.ratingCount})</span>
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
          {staff.role.replace("-", " ")}
        </span>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard compact label="Service revenue (mo)" value={monthServiceRevenue} format={(n) => inr(n, { compact: true })} />
        <MetricCard compact label="Product revenue (mo)" value={monthProductRevenue} format={(n) => inr(n, { compact: true })} />
        <MetricCard compact label="Commission (mo)" value={monthCommission} format={(n) => inr(n, { compact: true })} />
        <MetricCard
          compact
          label="Utilization (30d)"
          value={Math.round((perf?.utilization ?? 0) * 100)}
          format={(n) => `${n}%`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Revenue by service · this month</h2>
          <BarList
            className="mt-4"
            items={[...svcRevenue.entries()]
              .map(([sid, v]) => ({
                label: SERVICES.find((s) => s.id === sid)?.name ?? sid,
                value: v,
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)}
            formatValue={(v) => inr(v, { compact: true })}
          />
        </section>

        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Commission rules</h2>
          <ul className="mt-3 grid gap-1.5">
            {staff.commissionRules.map((rule) => (
              <li
                key={rule.serviceCategory}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
              >
                <span>{CATEGORY_LABEL[rule.serviceCategory] ?? rule.serviceCategory}</span>
                <span className="font-semibold tabular-nums">{percent(rule.rate)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Working hours</h2>
          <ul className="mt-3 grid gap-1">
            {staff.workingHours.map((wh) => (
              <li key={wh.day} className="flex justify-between text-sm">
                <span className={cn(wh.off && "text-muted-foreground")}>{DOW[wh.day]}</span>
                <span className={cn(wh.off ? "text-muted-foreground" : "tabular-nums")}>
                  {wh.off ? "Off" : `${wh.start} – ${wh.end}`}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Leave history</h2>
          {leaves.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No leave on record.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {leaves.map((l) => (
                <li key={l.id} className="flex items-center justify-between text-sm">
                  <span>
                    {l.startDate}
                    {l.endDate !== l.startDate && ` → ${l.endDate}`}
                    <span className="ml-2 text-xs text-muted-foreground">{l.reason}</span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      l.status === "pending" && "bg-warning/15 text-warning-foreground dark:text-warning",
                      l.status === "approved" && "bg-success/10 text-success",
                      l.status === "rejected" && "bg-destructive/10 text-destructive"
                    )}
                  >
                    {l.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {reviews.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Recent customer feedback
          </h2>
          <div className="grid gap-2 md:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-card p-4">
                <StarRating rating={r.ratingOverall} size="xs" />
                <p className="mt-1.5 line-clamp-3 text-sm">&ldquo;{r.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
