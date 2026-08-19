"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  CreditCard,
  ListPlus,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { WalkInSheet } from "@/components/reception/walk-in-sheet";
import { useDemoStore } from "@/lib/store";
import {
  appointmentsForDay,
  customerById,
  metricsForDay,
  queueForBranch,
  serviceNames,
  staffById,
} from "@/lib/selectors";
import { inr, timeLabel } from "@/lib/format";

const BRANCH_ID = "br_kakkanad";

export default function ReceptionHome() {
  const data = useDemoStore((s) => s.data);
  const checkIn = useDemoStore((s) => s.checkIn);
  const [walkInOpen, setWalkInOpen] = useState(false);

  const now = new Date();
  const todays = appointmentsForDay(data, BRANCH_ID, now);
  const metrics = metricsForDay(data, BRANCH_ID, now);
  const queue = queueForBranch(data, BRANCH_ID, now);

  // Arriving: confirmed appointments still ahead (or slightly past due).
  const arriving = todays
    .filter(
      (a) =>
        a.status === "confirmed" &&
        new Date(a.end).getTime() > now.getTime() - 30 * 60000
    )
    .slice(0, 8);

  const unpaid = todays.filter((a) => a.status === "completed" && !a.invoiceId);
  const freeBarbers = queue.staffState.filter((s) => s.state === "free");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
            Front desk · Kakkanad
          </h1>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/reception/calendar">
              <CalendarDays className="size-4" aria-hidden />
              Calendar
            </Link>
          </Button>
          <Button onClick={() => setWalkInOpen(true)}>
            <ListPlus className="size-4" aria-hidden />
            Walk-in
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard compact label="Appointments today" value={metrics.appointments} />
        <MetricCard compact label="Walk-ins" value={metrics.walkIns} />
        <MetricCard compact label="Waiting now" value={queue.waiting.length} />
        <MetricCard
          compact
          label="Collected today"
          value={metrics.revenue}
          format={(n) => inr(n)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Arriving */}
        <section aria-label="Arriving appointments">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Arriving ({arriving.length})
            </h2>
            <Link
              href="/reception/check-in"
              className="text-xs font-medium text-primary hover:underline"
            >
              Full check-in list
            </Link>
          </div>
          {arriving.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No upcoming arrivals"
              description="Confirmed bookings for later today will appear here."
            />
          ) : (
            <div className="grid gap-2">
              {arriving.map((appt) => {
                const customer = customerById(data, appt.customerId);
                const staff = staffById(appt.staffId);
                return (
                  <div
                    key={appt.id}
                    className="flex items-center gap-3 rounded-2xl border bg-card p-3.5"
                  >
                    <div className="flex w-14 shrink-0 flex-col items-center">
                      <span className="font-heading text-sm font-semibold">
                        {timeLabel(appt.start)}
                      </span>
                      {appt.advancePaid && (
                        <span className="mt-0.5 rounded-full bg-success/10 px-1.5 text-[9px] font-medium text-success">
                          ₹{appt.advanceAmount} paid
                        </span>
                      )}
                    </div>
                    {customer && (
                      <ToneAvatar
                        name={customer.name}
                        toneName={customer.avatarTone}
                        size="sm"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{customer?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {serviceNames(appt.serviceIds)} ·{" "}
                        {staff ? staff.name : "Any barber"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {customer?.phone && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9"
                          asChild
                        >
                          <a
                            href={`tel:${customer.phone.replace(/\s/g, "")}`}
                            aria-label={`Call ${customer.name}`}
                          >
                            <Phone className="size-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          checkIn(appt.id);
                          toast.success(`${customer?.name} checked in`, {
                            description: "Added to the live queue.",
                          });
                        }}
                      >
                        <Check className="size-4" aria-hidden />
                        Check in
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right column: queue snapshot + unpaid */}
        <div className="space-y-6">
          <section aria-label="Queue snapshot">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Queue · {queue.waiting.length} waiting
              </h2>
              <Link
                href="/reception/queue"
                className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
              >
                Open queue
                <ChevronRight className="size-3" aria-hidden />
              </Link>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              {queue.serving.length === 0 && queue.waiting.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Queue is clear right now.
                </p>
              ) : (
                <ul className="grid gap-2.5">
                  {queue.serving.map((appt) => {
                    const c = customerById(data, appt.customerId);
                    const st = staffById(appt.staffId);
                    return (
                      <li key={appt.id} className="flex items-center gap-2.5 text-sm">
                        <span className="size-2 shrink-0 animate-pulse rounded-full bg-success" />
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium">{c?.name}</span>{" "}
                          <span className="text-muted-foreground">
                            with {st?.name}
                          </span>
                        </span>
                        <StatusBadge status="in-service" className="shrink-0" />
                      </li>
                    );
                  })}
                  {queue.waiting.map((appt, i) => {
                    const c = customerById(data, appt.customerId);
                    return (
                      <li key={appt.id} className="flex items-center gap-2.5 text-sm">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {c?.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          ~{appt.estimatedWaitMin ?? 10} min
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  {freeBarbers.length > 0
                    ? `Free now: ${freeBarbers.map((s) => s.staff.name).join(", ")}`
                    : "All barbers are engaged."}
                </p>
              </div>
            </div>
          </section>

          <section aria-label="Unpaid bills">
            <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Unpaid bills ({unpaid.length})
            </h2>
            {unpaid.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                All completed services are settled.
              </div>
            ) : (
              <div className="grid gap-2">
                {unpaid.map((appt) => {
                  const c = customerById(data, appt.customerId);
                  return (
                    <div
                      key={appt.id}
                      className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/5 p-3.5"
                    >
                      {c && <ToneAvatar name={c.name} toneName={c.avatarTone} size="sm" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{c?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {serviceNames(appt.serviceIds)}
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/reception/pos?appointment=${appt.id}` as "/"}>
                          <CreditCard className="size-4" aria-hidden />
                          Checkout
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <WalkInSheet open={walkInOpen} onOpenChange={setWalkInOpen} branchId={BRANCH_ID} />
    </div>
  );
}
