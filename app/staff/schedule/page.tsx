"use client";

import { useState } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { customerById, serviceNames } from "@/lib/selectors";
import { findGaps } from "@/lib/availability";
import { timeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const STAFF_ID = "st_akhil";

export default function StaffSchedulePage() {
  const data = useDemoStore((s) => s.data);
  const [dayOffset, setDayOffset] = useState(0);
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const selectedDay = days[dayOffset];

  const dateKey = format(selectedDay, "yyyy-MM-dd");
  const shift = data.shifts.find(
    (s) => s.staffId === STAFF_ID && s.date === dateKey
  );
  const onLeave = data.leaveRequests.some(
    (l) =>
      l.staffId === STAFF_ID &&
      l.status === "approved" &&
      l.startDate <= dateKey &&
      dateKey <= l.endDate
  );

  const appts = data.appointments
    .filter(
      (a) =>
        a.staffId === STAFF_ID &&
        isSameDay(new Date(a.start), selectedDay) &&
        a.status !== "cancelled"
    )
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const gaps = findGaps(data, STAFF_ID, selectedDay).filter((g) => g.minutes >= 25);

  // Merge appointments and gaps into one timeline.
  const timeline: Array<
    | { kind: "appt"; appt: (typeof appts)[number] }
    | { kind: "gap"; start: Date; minutes: number }
  > = [
    ...appts.map((appt) => ({ kind: "appt" as const, appt })),
    ...gaps.map((g) => ({ kind: "gap" as const, start: g.start, minutes: g.minutes })),
  ].sort((a, b) => {
    const ta = a.kind === "appt" ? new Date(a.appt.start).getTime() : a.start.getTime();
    const tb = b.kind === "appt" ? new Date(b.appt.start).getTime() : b.start.getTime();
    return ta - tb;
  });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Schedule</h1>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar" role="tablist" aria-label="Choose day">
        {days.map((day, i) => {
          const active = i === dayOffset;
          return (
            <button
              key={day.toISOString()}
              role="tab"
              aria-selected={active}
              onClick={() => setDayOffset(i)}
              className={cn(
                "flex min-w-14 shrink-0 flex-col items-center rounded-xl border px-3 py-2.5",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-card"
              )}
            >
              <span className={cn("text-[10px] font-medium uppercase", !active && "text-muted-foreground")}>
                {i === 0 ? "Today" : format(day, "EEE")}
              </span>
              <span className="font-heading text-lg font-semibold">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>

      {onLeave || shift?.status === "leave" ? (
        <EmptyState
          icon={CalendarDays}
          title="On leave"
          description={`You're on approved leave ${format(selectedDay, "EEEE, d MMM")}.`}
        />
      ) : shift?.status === "off" || !shift?.start ? (
        <EmptyState
          icon={CalendarDays}
          title="Day off"
          description={`No shift scheduled for ${format(selectedDay, "EEEE, d MMM")}.`}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Shift: <strong className="text-foreground">{shift.start} – {shift.end}</strong> ·{" "}
            {appts.length} appointment{appts.length === 1 ? "" : "s"}
          </p>
          <ol className="grid gap-1.5">
            {timeline.map((item, i) =>
              item.kind === "appt" ? (
                <li
                  key={item.appt.id}
                  className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                >
                  <span className="w-16 shrink-0 text-xs font-medium tabular-nums">
                    {timeLabel(item.appt.start)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {customerById(data, item.appt.customerId)?.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {serviceNames(item.appt.serviceIds)}
                    </p>
                  </div>
                  <StatusBadge status={item.appt.status} />
                </li>
              ) : (
                <li
                  key={`gap-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-2.5"
                >
                  <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {format(item.start, "h:mm a")}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {item.minutes} min open —{" "}
                    <span className="font-medium text-foreground">
                      fits {item.minutes >= 45 ? "Haircut + Beard" : item.minutes >= 30 ? "Haircut or Head Massage" : "Beard Trim or Kids Cut"}
                    </span>
                  </p>
                </li>
              )
            )}
            {timeline.length === 0 && (
              <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                Fully open day — no bookings yet.
              </p>
            )}
          </ol>
        </>
      )}
    </div>
  );
}
