"use client";

import { useRouter } from "next/navigation";
// Unified owner+barber Today screen (Demo V1.1). One glance answers:
// who's next, what's free, who's waiting, how the day is going.

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";
import {
  CalendarPlus,
  Check,
  ChevronRight,
  Clock,
  ListPlus,
  Megaphone,
  Play,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddAppointmentSheet } from "@/components/shop/add-appointment-sheet";
import { WalkInSheet } from "@/components/reception/walk-in-sheet";
import { InstallCard } from "@/components/pwa/install-app";
import { useDemoStore } from "@/lib/store";
import {
  customerById,
  metricsForDay,
  queueForBranch,
  serviceNames,
  staffById,
  staffForBranch,
} from "@/lib/selectors";
import { ALL_BRANCHES } from "@/lib/data/seed-static";
import { inr, timeLabel } from "@/lib/format";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/utils";

export default function ShopToday() {
  const router = useRouter();
  const data = useDemoStore((s) => s.data);
  const startService = useDemoStore((s) => s.startService);
  const completeService = useDemoStore((s) => s.completeService);
  const acceptBookingRequest = useDemoStore((s) => s.acceptBookingRequest);
  const suggestBookingTime = useDemoStore((s) => s.suggestBookingTime);
  const declineBookingRequest = useDemoStore((s) => s.declineBookingRequest);
  const updateConfig = useDemoStore((s) => s.updateConfig);

  const now = useNow(30000);
  const [addOpen, setAddOpen] = useState(false);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [presetStart, setPresetStart] = useState<Date | null>(null);

  const branchId = data.branchId;
  const branch = ALL_BRANCHES.find((b) => b.id === branchId);
  const roster = staffForBranch(data, branchId, { activeOn: now });
  const owner = roster.find((s) => s.title.includes("Owner"));
  const solo = roster.length <= 1;
  const [staffFilter, setStaffFilter] = useState<string>("all");

  const hoursToday = branch?.hours.find((h) => h.day === now.getDay());
  const closedToday = !hoursToday || hoursToday.closed;

  const metrics = metricsForDay(data, branchId, now);
  const queue = queueForBranch(data, branchId, now);

  const todays = useMemo(
    () =>
      data.appointments
        .filter(
          (a) =>
            a.branchId === branchId &&
            isSameDay(new Date(a.start), now) &&
            !["cancelled", "no-show"].includes(a.status) &&
            (staffFilter === "all" || a.staffId === staffFilter)
        )
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [data.appointments, branchId, now, staffFilter]
  );

  // Timeline with actionable FREE gaps (≥20 min between consecutive items).
  const timeline = useMemo(() => {
    const items: Array<
      | { kind: "appt"; appt: (typeof todays)[number] }
      | { kind: "free"; start: Date; minutes: number }
    > = [];
    const dayEnd = new Date(now);
    if (hoursToday && !hoursToday.closed) {
      const [ch, cm] = hoursToday.close.split(":").map(Number);
      dayEnd.setHours(ch ?? 20, cm ?? 0, 0, 0);
    }
    let cursor = new Date(Math.max(now.getTime(), 0));
    const upcoming = todays.filter((a) => new Date(a.end) > now);
    for (const a of upcoming) {
      const start = new Date(a.start);
      const gapMin = Math.floor((start.getTime() - cursor.getTime()) / 60000);
      if (gapMin >= 20 && (solo || staffFilter !== "all")) {
        items.push({ kind: "free", start: new Date(cursor), minutes: gapMin });
      }
      items.push({ kind: "appt", appt: a });
      if (new Date(a.end) > cursor) cursor = new Date(a.end);
    }
    const tailMin = Math.floor((dayEnd.getTime() - cursor.getTime()) / 60000);
    if (tailMin >= 20 && (solo || staffFilter !== "all")) {
      items.push({ kind: "free", start: new Date(cursor), minutes: tailMin });
    }
    return items;
  }, [todays, now, hoursToday, solo, staffFilter]);

  const pendingRequests = data.bookingRequests.filter(
    (r) => r.status === "requested" || r.status === "suggested"
  );

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {greeting}, {owner?.name ?? "boss"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {closedToday ? (
            <span className="font-medium text-destructive">Closed today</span>
          ) : (
            <>
              Open ·{" "}
              <span className="text-success">
                until {format(new Date(0, 0, 0, ...(hoursToday!.close.split(":").map(Number) as [number, number])), "h:mm a")}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="lg"
          className="h-13 min-h-12"
          onClick={() => {
            setPresetStart(null);
            setAddOpen(true);
          }}
        >
          <CalendarPlus className="size-5" aria-hidden />
          Appointment
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-13 min-h-12"
          onClick={() => setWalkInOpen(true)}
        >
          <ListPlus className="size-5" aria-hidden />
          Walk-in
        </Button>
      </div>

      {/* Booking requests inbox */}
      {data.config.bookingMode === "online_request" && pendingRequests.length > 0 && (
        <section aria-label="Booking requests">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <span className="size-2 animate-pulse rounded-full bg-warning" aria-hidden />
            New requests ({pendingRequests.length})
          </h2>
          <div className="grid gap-2">
            {pendingRequests.map((req) => (
              <div key={req.id} className="rounded-2xl border border-warning/40 bg-warning/5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{req.customerName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {serviceNames(req.serviceIds)} · requested{" "}
                      {timeLabel(req.preferredStart)}
                      {req.status === "suggested" && req.suggestedStart && (
                        <span className="text-info">
                          {" "}
                          · you suggested {timeLabel(req.suggestedStart)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {req.status === "requested" && (
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => {
                        acceptBookingRequest(req.id);
                        toast.success(`${req.customerName} confirmed`);
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const suggested = new Date(
                          new Date(req.preferredStart).getTime() + 45 * 60000
                        ).toISOString();
                        suggestBookingTime(req.id, suggested);
                        toast(`Suggested ${timeLabel(suggested)} to ${req.customerName}`);
                      }}
                    >
                      Suggest
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        declineBookingRequest(req.id);
                        toast("Request declined");
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Growth prompt (small shop) */}
      {data.scenario === "small" &&
        data.config.bookingMode === "staff_only" &&
        roster.length >= 3 && (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
            <Megaphone className="size-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                You now have {roster.length} barbers.
              </p>
              <p className="text-xs text-muted-foreground">
                Want to let customers request bookings online?
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                updateConfig({ bookingMode: "online_request" });
                toast.success("Online booking requests enabled", {
                  description: "Customers can now request a time on your public page.",
                });
              }}
            >
              Set up
            </Button>
          </div>
        )}

      {/* Staff filter (small shop) */}
      {!solo && (
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 no-scrollbar">
          {[{ id: "all", name: "All" }, ...roster].map((s) => (
            <button
              key={s.id}
              onClick={() => setStaffFilter(s.id)}
              aria-pressed={staffFilter === s.id}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium",
                staffFilter === s.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card"
              )}
            >
              {s.id === owner?.id ? "Me" : s.name}
            </button>
          ))}
        </div>
      )}

      {/* Today timeline */}
      <section aria-label="Today's schedule">
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Today · {format(now, "EEE d MMM")}
        </h2>
        {closedToday ? (
          <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Shop is closed today. Enjoy the break ✂️
          </p>
        ) : timeline.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nothing else scheduled today. Add a booking or take walk-ins.
          </p>
        ) : (
          <ol className="grid gap-1.5">
            {timeline.map((item, i) =>
              item.kind === "appt" ? (
                <li
                  key={item.appt.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3",
                    item.appt.status === "in-service" && "border-success/40 bg-success/5"
                  )}
                >
                  <span className="w-16 shrink-0 text-sm font-semibold tabular-nums">
                    {timeLabel(item.appt.start)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {customerById(data, item.appt.customerId)?.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {serviceNames(item.appt.serviceIds)}
                      {!solo && staffFilter === "all" && item.appt.staffId && (
                        <>
                          {" · "}
                          {item.appt.staffId === owner?.id
                            ? "Me"
                            : staffById(item.appt.staffId, data)?.name}
                        </>
                      )}
                      {" · "}
                      {item.appt.source}
                    </p>
                  </div>
                  {item.appt.status === "waiting" || item.appt.status === "checked-in" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        startService(item.appt.id);
                        toast.success("Started");
                      }}
                    >
                      <Play className="size-3.5" aria-hidden />
                      Start
                    </Button>
                  ) : item.appt.status === "in-service" ? (
                    <Button
                      size="sm"
                      className="bg-success text-white hover:bg-success/90"
                      onClick={() => {
                        completeService(item.appt.id);
                        toast.success("Completed — collect at POS", {
                          action: {
                            label: "POS",
                            onClick: () => {
                              router.push(
                                `/shop/pos?appointment=${item.appt.id}` as Parameters<typeof router.push>[0]
                              );
                            },
                          },
                        });
                      }}
                    >
                      <Check className="size-3.5" aria-hidden />
                      Done
                    </Button>
                  ) : (
                    <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                      {item.appt.status === "completed" ? (
                        <Check className="size-4 text-success" aria-hidden />
                      ) : (
                        "booked"
                      )}
                    </span>
                  )}
                </li>
              ) : (
                <li
                  key={`free-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-dashed px-3.5 py-2.5"
                >
                  <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {format(item.start, "h:mm a")}
                  </span>
                  <p className="flex-1 text-xs font-medium text-success">
                    FREE · {item.minutes >= 60 ? `${Math.floor(item.minutes / 60)}h ${item.minutes % 60}m` : `${item.minutes} min`}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-primary"
                    onClick={() => {
                      setPresetStart(item.start);
                      setAddOpen(true);
                    }}
                  >
                    Add
                  </Button>
                </li>
              )
            )}
          </ol>
        )}
      </section>

      {/* Queue snapshot */}
      <section aria-label="Queue">
        <Link
          href="/shop/queue"
          className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-warning/15">
            <Clock className="size-5 text-warning-foreground dark:text-warning" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              Queue · {queue.waiting.length} waiting
            </p>
            <p className="text-xs text-muted-foreground">
              {queue.serving.length > 0
                ? `Serving ${customerById(data, queue.serving[0].customerId)?.name}`
                : queue.waiting.length > 0
                  ? `Next: ${customerById(data, queue.waiting[0].customerId)?.name} · ~${queue.waiting[0].estimatedWaitMin ?? 5} min`
                  : "No one waiting right now"}
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </Link>
      </section>

      {/* Today numbers */}
      <section aria-label="Today's numbers" className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border bg-sidebar p-4 text-sidebar-foreground">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-sidebar-primary uppercase">
            <Wallet className="size-3.5" aria-hidden />
            Today
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-sidebar-accent-foreground tabular-nums">
            {inr(metrics.revenue)}
          </p>
          <p className="text-xs text-sidebar-foreground/70">revenue</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            Customers
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
            {metrics.customers}
          </p>
          <p className="text-xs text-muted-foreground">
            {metrics.walkIns} walk-ins · {metrics.completed} done
          </p>
        </div>
      </section>

      <InstallCard />

      <AddAppointmentSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        presetStart={presetStart}
      />
      <WalkInSheet open={walkInOpen} onOpenChange={setWalkInOpen} branchId={branchId} />
    </div>
  );
}
