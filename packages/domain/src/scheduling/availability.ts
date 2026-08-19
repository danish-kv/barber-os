// The scheduling engine. Ported verbatim from Demo V1's lib/availability.ts
// (behavior pinned by apps/web tests); only the data plumbing changed — all
// inputs arrive through SchedulingContext instead of the demo store.
//
// Proven behaviors preserved:
//  - slots derived from ACTUAL selection duration on a 15-min grid,
//    never fixed 30-min blocks;
//  - staff working hours ∩ branch hours;
//  - approved leave removes the whole day;
//  - existing busy intervals block exactly their span;
//  - today's slots start no earlier than now + 10 min;
//  - weekend-evening demand flags ("popular" / "almost-full").

import { addMinutes, format, isSameDay, startOfDay } from "date-fns";
import type {
  ApprovedLeave,
  BusyInterval,
  Gap,
  SchedulingContext,
  SchedulableStaff,
  Slot,
} from "./types.js";

const DEFAULT_GRID_MIN = 15;

function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function isOnLeave(leave: ApprovedLeave[], staffId: string, dateKey: string) {
  return leave.some(
    (l) => l.staffId === staffId && l.startDate <= dateKey && dateKey <= l.endDate
  );
}

function busyFor(busy: BusyInterval[], staffId: string, day: Date) {
  return busy
    .filter((b) => b.staffId === staffId && isSameDay(new Date(b.start), day))
    .map((b) => ({
      start: new Date(b.start).getTime(),
      end: new Date(b.end).getTime(),
    }));
}

/** Compute genuinely-available start times for a staff member on a day,
 * honoring working hours, approved leave, existing bookings and the actual
 * total duration of the selected services (not fixed 30-min slots). */
export function availableSlotsForStaff(
  ctx: SchedulingContext,
  staff: SchedulableStaff,
  day: Date,
  serviceIds: string[],
  addonIds: string[] = [],
  now = new Date()
): Slot[] {
  const gridMin = ctx.gridMinutes ?? DEFAULT_GRID_MIN;
  const dow = day.getDay();
  const wh = staff.workingHours.find((w) => w.day === dow);
  if (!wh || wh.off) return [];
  const dateKey = format(day, "yyyy-MM-dd");
  if (isOnLeave(ctx.approvedLeave, staff.id, dateKey)) return [];

  const branchHours = ctx.branchHours.find((h) => h.day === dow);
  if (!branchHours || branchHours.closed) return [];

  const openMin = Math.max(
    hhmmToMinutes(wh.start),
    hhmmToMinutes(branchHours.open)
  );
  const closeMin = Math.min(
    hhmmToMinutes(wh.end),
    hhmmToMinutes(branchHours.close)
  );

  const duration = ctx.durationOf(serviceIds, addonIds);
  if (duration <= 0) return [];

  const busy = busyFor(ctx.busy, staff.id, day);
  const dayStart = startOfDay(day);
  const slots: Slot[] = [];

  const isToday = isSameDay(day, now);
  const minStartMs = isToday ? now.getTime() + 10 * 60000 : 0;

  for (let m = openMin; m + duration <= closeMin; m += gridMin) {
    const slotStart = addMinutes(dayStart, m);
    const slotEnd = addMinutes(slotStart, duration);
    if (slotStart.getTime() < minStartMs) continue;
    const overlaps = busy.some(
      (b) => slotStart.getTime() < b.end && b.start < slotEnd.getTime()
    );
    if (overlaps) continue;

    const hour = slotStart.getHours();
    const period: Slot["period"] =
      hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const isWeekendEvening = (dow === 6 || dow === 0 || dow === 5) && hour >= 17;
    const demand: Slot["demand"] = isWeekendEvening
      ? "almost-full"
      : hour >= 17
        ? "popular"
        : "normal";

    slots.push({
      start: slotStart,
      label: format(slotStart, "h:mm a"),
      period,
      demand,
      staffId: staff.id,
    });
  }
  return slots;
}

/** "Any barber": merge each eligible staff member's availability, keeping the
 * earliest-resolving staff per time label so estimates stay realistic.
 * `staffList` order is the tie-break priority. */
export function availableSlotsAnyStaff(
  ctx: SchedulingContext,
  staffList: SchedulableStaff[],
  day: Date,
  serviceIds: string[],
  addonIds: string[] = [],
  now = new Date()
): Slot[] {
  const eligible = staffList.filter((s) =>
    serviceIds.every((id) => s.serviceIds.includes(id))
  );
  const byLabel = new Map<string, Slot>();
  for (const staff of eligible) {
    for (const slot of availableSlotsForStaff(
      ctx,
      staff,
      day,
      serviceIds,
      addonIds,
      now
    )) {
      if (!byLabel.has(slot.label)) byLabel.set(slot.label, slot);
    }
  }
  return [...byLabel.values()].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
}

/** Human label for the staff member's next opening within 7 days. */
export function nextAvailableLabel(
  ctx: SchedulingContext,
  staff: SchedulableStaff,
  serviceIds: string[],
  now = new Date()
): string | null {
  for (let d = 0; d < 7; d++) {
    const day = addMinutes(startOfDay(now), d * 24 * 60);
    const slots = availableSlotsForStaff(ctx, staff, day, serviceIds, [], now);
    if (slots.length > 0) {
      const s = slots[0]!;
      if (d === 0) return format(s.start, "h:mm a");
      if (d === 1) return `Tomorrow ${format(s.start, "h:mm a")}`;
      return format(s.start, "EEE h:mm a");
    }
  }
  return null;
}

/** Find idle gaps in a staff member's day — powers "gap filling" suggestions. */
export function findGaps(
  ctx: SchedulingContext,
  staff: SchedulableStaff,
  day: Date
): Gap[] {
  const dow = day.getDay();
  const wh = staff.workingHours.find((w) => w.day === dow);
  if (!wh || wh.off) return [];
  const dayStart = startOfDay(day);
  const open = addMinutes(dayStart, hhmmToMinutes(wh.start));
  const close = addMinutes(dayStart, hhmmToMinutes(wh.end));

  const busy = busyFor(ctx.busy, staff.id, day).sort((a, b) => a.start - b.start);
  const gaps: Gap[] = [];
  let cursor = open.getTime();
  for (const b of busy) {
    if (b.start - cursor >= 20 * 60000) {
      gaps.push({
        start: new Date(cursor),
        end: new Date(b.start),
        minutes: Math.round((b.start - cursor) / 60000),
      });
    }
    cursor = Math.max(cursor, b.end);
  }
  if (close.getTime() - cursor >= 20 * 60000) {
    gaps.push({
      start: new Date(cursor),
      end: close,
      minutes: Math.round((close.getTime() - cursor) / 60000),
    });
  }
  return gaps;
}
