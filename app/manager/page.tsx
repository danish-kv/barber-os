"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, CalendarOff, Package } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import {
  lowStockItems,
  metricsForDay,
  queueForBranch,
} from "@/lib/selectors";
import { STAFF } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const BRANCH_ID = "br_kakkanad";

export default function ManagerHome() {
  const data = useDemoStore((s) => s.data);
  const now = new Date();
  const metrics = metricsForDay(data, BRANCH_ID, now);
  const queue = queueForBranch(data, BRANCH_ID, now);
  const lowStock = lowStockItems(data, BRANCH_ID);
  const pendingLeave = data.leaveRequests.filter(
    (l) => l.branchId === BRANCH_ID && l.status === "pending"
  );

  const dateKey = format(now, "yyyy-MM-dd");
  const branchStaff = STAFF.filter((s) => s.branchId === BRANCH_ID);
  const workingToday = branchStaff.filter((s) => {
    const shift = data.shifts.find(
      (sh) => sh.staffId === s.id && sh.date === dateKey
    );
    return shift && shift.status !== "off" && shift.status !== "leave";
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
          Kakkanad branch
        </h1>
        <p className="text-sm text-muted-foreground">
          {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard compact label="Revenue today" value={metrics.revenue} format={(n) => inr(n)} />
        <MetricCard compact label="Appointments" value={metrics.appointments} />
        <MetricCard compact label="Staff working" value={workingToday.length} hint={`of ${branchStaff.length}`} />
        <MetricCard compact label="In queue" value={queue.waiting.length} />
      </section>

      {/* Action items */}
      {(pendingLeave.length > 0 || lowStock.length > 0) && (
        <section className="grid gap-3 md:grid-cols-2">
          {pendingLeave.length > 0 && (
            <Link
              href="/manager/leave"
              className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/5 p-4 transition-shadow hover:shadow-md"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-warning/15">
                <CalendarOff className="size-5 text-warning-foreground dark:text-warning" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {pendingLeave.length} leave request{pendingLeave.length > 1 ? "s" : ""} pending
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {pendingLeave
                    .map((l) => STAFF.find((s) => s.id === l.staffId)?.name)
                    .join(", ")}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link
              href="/manager/inventory"
              className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 transition-shadow hover:shadow-md"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-destructive/10">
                <Package className="size-5 text-destructive" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {lowStock.length} item{lowStock.length > 1 ? "s" : ""} low on stock
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {lowStock.map((i) => i.name).join(", ")}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          )}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Staff on floor */}
        <section className="rounded-2xl border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Staff on the floor</h2>
            <Link href="/manager/staff" className="text-xs font-medium text-primary hover:underline">
              Manage staff
            </Link>
          </div>
          <ul className="mt-3 grid gap-2.5">
            {queue.staffState.map(({ staff, state, remainingMin }) => (
              <li key={staff.id} className="flex items-center gap-2.5">
                <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.title}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    state === "serving" && "bg-success/10 text-success",
                    state === "free" && "bg-info/10 text-info",
                    state === "break" && "bg-warning/15 text-warning-foreground dark:text-warning",
                    (state === "off" || state === "leave") && "bg-muted text-muted-foreground"
                  )}
                >
                  {state === "serving"
                    ? `Serving · ${remainingMin}m`
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
        </section>

        {/* Today snapshot */}
        <section className="rounded-2xl border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Today snapshot</h2>
            <Link href="/manager/calendar" className="text-xs font-medium text-primary hover:underline">
              Calendar
            </Link>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {[
              { label: "Completed", value: metrics.completed },
              { label: "Walk-ins", value: metrics.walkIns },
              { label: "Cancellations", value: metrics.cancelled },
              { label: "No-shows", value: metrics.noShows },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/50 p-3">
                <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                <dd className="font-heading text-lg font-semibold tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Average ticket today: <strong>{inr(metrics.avgTicket)}</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
