import { addMinutes, format, isSameDay, startOfDay } from "date-fns";
import type { Appointment, Staff } from "@/lib/types";
import { BRANCHES, STAFF } from "@/lib/data/seed-static";
import { durationForSelection } from "@/lib/store";
import type { DemoData } from "@/lib/data/seed";

const GRID_MIN = 15;

export interface Slot {
  start: Date;
  label: string; // "5:30 PM"
  period: "morning" | "afternoon" | "evening";
  demand: "normal" | "popular" | "almost-full";
  staffId: string; // resolved staff (even for "any barber" requests)
}

function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isOnLeave(data: DemoData, staffId: string, dateKey: string) {
  return data.leaveRequests.some(
    (l) =>
      l.staffId === staffId &&
      l.status === "approved" &&
      l.startDate <= dateKey &&
      dateKey <= l.endDate
  );
}

function busyIntervals(appointments: Appointment[], staffId: string, day: Date) {
  return appointments
    .filter(
      (a) =>
        a.staffId === staffId &&
        !["cancelled", "no-show"].includes(a.status) &&
        isSameDay(new Date(a.start), day)
    )
    .map((a) => ({
      start: new Date(a.start).getTime(),
      end: new Date(a.end).getTime(),
    }));
}

/** Compute genuinely-available start times for a staff member on a day,
 * honoring working hours, approved leave, existing bookings and the actual
 * total duration of the selected services (not fixed 30-min slots). */
export function availableSlotsForStaff(
  data: DemoData,
  staff: Staff,
  day: Date,
  serviceIds: string[],
  addonIds: string[] = [],
  now = new Date()
): Slot[] {
  const dow = day.getDay();
  const wh = staff.workingHours.find((w) => w.day === dow);
  if (!wh || wh.off) return [];
  const dateKey = format(day, "yyyy-MM-dd");
  if (isOnLeave(data, staff.id, dateKey)) return [];

  const branch = BRANCHES.find((b) => b.id === staff.branchId);
  const branchHours = branch?.hours.find((h) => h.day === dow);
  if (!branchHours || branchHours.closed) return [];

  const openMin = Math.max(hhmmToMinutes(wh.start), hhmmToMinutes(branchHours.open));
  const closeMin = Math.min(hhmmToMinutes(wh.end), hhmmToMinutes(branchHours.close));

  const duration = durationForSelection(serviceIds, addonIds);
  if (duration <= 0) return [];

  const busy = busyIntervals(data.appointments, staff.id, day);
  const dayStart = startOfDay(day);
  const slots: Slot[] = [];

  const isToday = isSameDay(day, now);
  const minStartMs = isToday ? now.getTime() + 10 * 60000 : 0;

  for (let m = openMin; m + duration <= closeMin; m += GRID_MIN) {
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

/** "Any barber": merge each eligible barber's availability, keeping the
 * earliest-resolving staff per time label so estimates stay realistic. */
export function availableSlotsAnyStaff(
  data: DemoData,
  branchId: string,
  day: Date,
  serviceIds: string[],
  addonIds: string[] = [],
  now = new Date()
): Slot[] {
  const eligible = STAFF.filter(
    (s) =>
      s.branchId === branchId &&
      serviceIds.every((id) => s.serviceIds.includes(id))
  );
  const byLabel = new Map<string, Slot>();
  for (const staff of eligible) {
    for (const slot of availableSlotsForStaff(data, staff, day, serviceIds, addonIds, now)) {
      if (!byLabel.has(slot.label)) byLabel.set(slot.label, slot);
    }
  }
  return [...byLabel.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function nextAvailableLabel(
  data: DemoData,
  staff: Staff,
  serviceIds: string[],
  now = new Date()
): string | null {
  for (let d = 0; d < 7; d++) {
    const day = addMinutes(startOfDay(now), d * 24 * 60);
    const slots = availableSlotsForStaff(data, staff, day, serviceIds, [], now);
    if (slots.length > 0) {
      const s = slots[0];
      if (d === 0) return format(s.start, "h:mm a");
      if (d === 1) return `Tomorrow ${format(s.start, "h:mm a")}`;
      return format(s.start, "EEE h:mm a");
    }
  }
  return null;
}

/** Find idle gaps in a staff member's day — powers "gap filling" suggestions. */
export function findGaps(
  data: DemoData,
  staffId: string,
  day: Date
): Array<{ start: Date; end: Date; minutes: number }> {
  const staff = STAFF.find((s) => s.id === staffId);
  if (!staff) return [];
  const dow = day.getDay();
  const wh = staff.workingHours.find((w) => w.day === dow);
  if (!wh || wh.off) return [];
  const dayStart = startOfDay(day);
  const open = addMinutes(dayStart, hhmmToMinutes(wh.start));
  const close = addMinutes(dayStart, hhmmToMinutes(wh.end));

  const busy = busyIntervals(data.appointments, staffId, day).sort(
    (a, b) => a.start - b.start
  );
  const gaps: Array<{ start: Date; end: Date; minutes: number }> = [];
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
