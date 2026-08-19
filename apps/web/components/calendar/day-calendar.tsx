"use client";

// Hybrid day calendar: staff lanes × time. Online bookings and walk-ins share
// the same timeline. Click an appointment for actions.

import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { useNow } from "@/hooks/use-now";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Play, UserRoundX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import {
  customerById,
  serviceNames,
  staffById,
  staffForBranch,
} from "@/lib/selectors";
import { inr, timeLabel } from "@/lib/format";
import { priceForSelection } from "@/lib/store";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAY_START_H = 10;
const DAY_END_H = 20;
const PX_PER_MIN = 1.5;

const STATUS_STYLES: Record<string, string> = {
  confirmed: "border-info/50 bg-info/10 hover:bg-info/15",
  "checked-in": "border-accent-foreground/30 bg-accent/70 hover:bg-accent",
  waiting: "border-warning/50 bg-warning/10 hover:bg-warning/15",
  "in-service": "border-success/50 bg-success/10 hover:bg-success/15",
  completed: "border-border bg-muted/60 hover:bg-muted",
  "no-show": "border-destructive/40 bg-destructive/5 opacity-70",
  cancelled: "border-border bg-muted/40 opacity-50",
};

export function DayCalendar({
  branchId,
  readOnly = false,
}: {
  branchId: string;
  readOnly?: boolean;
}) {
  const data = useDemoStore((s) => s.data);
  const checkIn = useDemoStore((s) => s.checkIn);
  const startService = useDemoStore((s) => s.startService);
  const completeService = useDemoStore((s) => s.completeService);
  const markNoShow = useDemoStore((s) => s.markNoShow);
  const cancelAppointment = useDemoStore((s) => s.cancelAppointment);

  const [dayOffset, setDayOffset] = useState(0);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const now = useNow(30000);
  const todayKey = format(now, "yyyy-MM-dd");
  const day = useMemo(
    () => addDays(startOfDay(new Date(`${todayKey}T00:00:00`)), dayOffset),
    [todayKey, dayOffset]
  );
  const isToday = dayOffset === 0;
  const dateKey = format(day, "yyyy-MM-dd");

  const branchStaff = staffForBranch(data, branchId, { activeOn: day });

  const appts = useMemo(
    () =>
      data.appointments.filter(
        (a) =>
          a.branchId === branchId &&
          isSameDay(new Date(a.start), day) &&
          a.status !== "cancelled"
      ),
    [data.appointments, branchId, day]
  );

  const unassigned = appts.filter((a) => !a.staffId);

  const totalMinutes = (DAY_END_H - DAY_START_H) * 60;
  const laneHeight = totalMinutes * PX_PER_MIN;

  const yFor = (d: Date) =>
    ((d.getHours() - DAY_START_H) * 60 + d.getMinutes()) * PX_PER_MIN;

  const nowY = yFor(now);

  // Scroll to "now" on mount for today
  useEffect(() => {
    if (isToday && scrollRef.current && nowY > 100) {
      scrollRef.current.scrollTop = Math.max(0, nowY - 160);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isToday]);

  const hours = Array.from(
    { length: DAY_END_H - DAY_START_H + 1 },
    (_, i) => DAY_START_H + i
  );

  const staffOnLeave = (staffId: string) =>
    data.leaveRequests.some(
      (l) =>
        l.staffId === staffId &&
        l.status === "approved" &&
        l.startDate <= dateKey &&
        dateKey <= l.endDate
    );

  const selectedCustomer = selected ? customerById(data, selected.customerId) : null;

  const act = (fn: () => void, message: string) => {
    fn();
    toast.success(message);
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Day switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={() => setDayOffset((d) => d - 1)}
            aria-label="Previous day"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={() => setDayOffset((d) => d + 1)}
            aria-label="Next day"
          >
            <ChevronRight className="size-4" />
          </Button>
          {dayOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setDayOffset(0)}>
              Today
            </Button>
          )}
        </div>
        <p className="font-heading text-sm font-semibold">
          {format(day, "EEEE, d MMMM")}
        </p>
      </div>

      {/* Unassigned "any barber" bookings */}
      {unassigned.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed bg-card p-3">
          <span className="text-xs font-medium text-muted-foreground">
            Any-barber ({unassigned.length}):
          </span>
          {unassigned.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground hover:opacity-80"
            >
              {timeLabel(a.start)} · {customerById(data, a.customerId)?.name}
            </button>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div
        ref={scrollRef}
        className="max-h-[65dvh] overflow-auto rounded-2xl border bg-card"
      >
        <div className="flex min-w-fit">
          {/* time axis */}
          <div
            className="sticky left-0 z-10 w-14 shrink-0 border-r bg-card"
            style={{ height: laneHeight + 40 }}
          >
            <div className="h-10" />
            <div className="relative" style={{ height: laneHeight }}>
              {hours.map((h) => (
                <span
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[10px] text-muted-foreground tabular-nums"
                  style={{ top: (h - DAY_START_H) * 60 * PX_PER_MIN }}
                >
                  {format(new Date(2026, 0, 1, h), "h a")}
                </span>
              ))}
            </div>
          </div>

          {/* lanes */}
          {branchStaff.map((staff) => {
            const wh = staff.workingHours.find((w) => w.day === day.getDay());
            const off = !wh || wh.off || staffOnLeave(staff.id);
            const laneAppts = appts.filter((a) => a.staffId === staff.id);
            return (
              <div
                key={staff.id}
                className="w-40 shrink-0 border-r last:border-r-0 sm:w-44 lg:w-auto lg:flex-1"
              >
                {/* lane header */}
                <div className="sticky top-0 z-10 flex h-10 items-center gap-2 border-b bg-card px-2.5">
                  <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="xs" />
                  <span className="min-w-0 truncate text-xs font-semibold">{staff.name}</span>
                  {off && (
                    <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                      {staffOnLeave(staff.id) ? "Leave" : "Off"}
                    </span>
                  )}
                </div>
                {/* lane body */}
                <div
                  className={cn("relative", off && "bg-muted/40 bg-noise")}
                  style={{ height: laneHeight }}
                >
                  {/* hour lines */}
                  {hours.slice(1).map((h) => (
                    <div
                      key={h}
                      aria-hidden
                      className="absolute inset-x-0 border-t border-border/50"
                      style={{ top: (h - DAY_START_H) * 60 * PX_PER_MIN }}
                    />
                  ))}
                  {/* now line */}
                  {isToday && nowY > 0 && nowY < laneHeight && (
                    <div
                      aria-hidden
                      className="absolute inset-x-0 z-10 border-t-2 border-destructive/70"
                      style={{ top: nowY }}
                    />
                  )}
                  {/* appointments */}
                  {laneAppts.map((a) => {
                    const start = new Date(a.start);
                    const end = new Date(a.end);
                    const top = Math.max(0, yFor(start));
                    const height = Math.max(
                      24,
                      ((end.getTime() - start.getTime()) / 60000) * PX_PER_MIN - 2
                    );
                    const customer = customerById(data, a.customerId);
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelected(a)}
                        className={cn(
                          "absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1 text-left transition-colors",
                          STATUS_STYLES[a.status] ?? "bg-muted"
                        )}
                        style={{ top, height }}
                        aria-label={`${customer?.name}, ${serviceNames(a.serviceIds)}, ${timeLabel(a.start)}, ${a.status}`}
                      >
                        <p className="truncate text-[11px] leading-tight font-semibold">
                          {customer?.name}
                        </p>
                        {height > 40 && (
                          <p className="truncate text-[10px] leading-tight text-muted-foreground">
                            {serviceNames(a.serviceIds)}
                          </p>
                        )}
                        {height > 58 && (
                          <p className="mt-0.5 text-[9px] text-muted-foreground tabular-nums">
                            {timeLabel(a.start)} · {a.source === "walk-in" ? "walk-in" : "online"}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {(
          [
            ["confirmed", "Confirmed"],
            ["waiting", "Waiting"],
            ["in-service", "In service"],
            ["completed", "Completed"],
            ["no-show", "No show"],
          ] as const
        ).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className={cn("inline-block size-2.5 rounded-sm border", STATUS_STYLES[key])}
              aria-hidden
            />
            {label}
          </span>
        ))}
      </div>

      {/* Appointment detail sheet */}
      <BottomSheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selectedCustomer?.name ?? "Appointment"}
        description={selected ? serviceNames(selected.serviceIds) : undefined}
      >
        {selected && (
          <div className="grid gap-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">
                  {timeLabel(selected.start)} – {timeLabel(selected.end)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selected.staffId
                    ? staffById(selected.staffId, data)?.name
                    : "Any barber"}{" "}
                  · {selected.source} · {inr(priceForSelection(selected.serviceIds, selected.addonIds))}
                  {selected.advancePaid && ` · ₹${selected.advanceAmount} advance paid`}
                </p>
              </div>
              <StatusBadge status={selected.status as AppointmentStatus} />
            </div>

            {!readOnly && (
              <div className="grid grid-cols-2 gap-2">
                {selected.status === "confirmed" && (
                  <>
                    <Button
                      onClick={() =>
                        act(() => checkIn(selected.id), `${selectedCustomer?.name} checked in`)
                      }
                    >
                      <Check className="size-4" aria-hidden />
                      Check in
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        act(() => markNoShow(selected.id), "Marked as no-show")
                      }
                    >
                      <UserRoundX className="size-4" aria-hidden />
                      No-show
                    </Button>
                    <Button
                      variant="ghost"
                      className="col-span-2 text-destructive hover:text-destructive"
                      onClick={() =>
                        act(
                          () => cancelAppointment(selected.id, "Cancelled at desk"),
                          "Appointment cancelled"
                        )
                      }
                    >
                      <X className="size-4" aria-hidden />
                      Cancel appointment
                    </Button>
                  </>
                )}
                {(selected.status === "waiting" || selected.status === "checked-in") && (
                  <Button
                    className="col-span-2"
                    onClick={() =>
                      act(() => startService(selected.id), "Service started")
                    }
                  >
                    <Play className="size-4" aria-hidden />
                    Start service
                  </Button>
                )}
                {selected.status === "in-service" && (
                  <Button
                    className="col-span-2 bg-success text-white hover:bg-success/90"
                    onClick={() =>
                      act(() => completeService(selected.id), "Service completed")
                    }
                  >
                    <Check className="size-4" aria-hidden />
                    Complete service
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
