// Demo adapter for the scheduling engine. The algorithm now lives in
// @barbershop-os/domain (shared with the future API, where it is
// authoritative — here it only powers the demo/preview experience). This
// module binds the demo store's data shapes to the engine's inputs and keeps
// the exact signatures the existing call sites already use.

import {
  availableSlotsAnyStaff as engineAnyStaff,
  availableSlotsForStaff as engineForStaff,
  findGaps as engineFindGaps,
  nextAvailableLabel as engineNextAvailable,
  type SchedulingContext,
  type Slot,
} from "@barbershop-os/domain";
import type { Staff } from "@/lib/types";
import { ALL_BRANCHES } from "@/lib/data/seed-static";
import { durationForSelection } from "@/lib/store";
import { isStaffActiveOn, staffForBranch } from "@/lib/selectors";
import type { DemoData } from "@/lib/data/seed";

export type { Slot };

function contextFor(data: DemoData, branchId: string): SchedulingContext {
  const branch = ALL_BRANCHES.find((b) => b.id === branchId);
  return {
    branchHours: branch?.hours ?? [],
    // Verbatim demo semantics: everything except cancelled/no-show holds
    // capacity. (Production adds pending_payment explicitly — see
    // DOMAIN_MODEL.md invariant #1.)
    busy: data.appointments
      .filter(
        (a) =>
          a.staffId !== null && !["cancelled", "no-show"].includes(a.status)
      )
      .map((a) => ({
        staffId: a.staffId as string,
        start: a.start,
        end: a.end,
      })),
    approvedLeave: data.leaveRequests
      .filter((l) => l.status === "approved")
      .map((l) => ({
        staffId: l.staffId,
        startDate: l.startDate,
        endDate: l.endDate,
      })),
    durationOf: durationForSelection,
  };
}

export function availableSlotsForStaff(
  data: DemoData,
  staff: Staff,
  day: Date,
  serviceIds: string[],
  addonIds: string[] = [],
  now = new Date()
): Slot[] {
  // Temporary/contract staff have no availability outside their window.
  if (!isStaffActiveOn(staff, day)) return [];
  return engineForStaff(
    contextFor(data, staff.branchId),
    staff,
    day,
    serviceIds,
    addonIds,
    now
  );
}

export function availableSlotsAnyStaff(
  data: DemoData,
  branchId: string,
  day: Date,
  serviceIds: string[],
  addonIds: string[] = [],
  now = new Date()
): Slot[] {
  const staffList = staffForBranch(data, branchId, { activeOn: day });
  return engineAnyStaff(
    contextFor(data, branchId),
    staffList,
    day,
    serviceIds,
    addonIds,
    now
  );
}

export function nextAvailableLabel(
  data: DemoData,
  staff: Staff,
  serviceIds: string[],
  now = new Date()
): string | null {
  return engineNextAvailable(
    contextFor(data, staff.branchId),
    staff,
    serviceIds,
    now
  );
}

export function findGaps(data: DemoData, staffId: string, day: Date) {
  const staff = staffForBranch(data, "all", { includeInactive: true }).find(
    (s) => s.id === staffId
  );
  if (!staff) return [];
  return engineFindGaps(contextFor(data, staff.branchId), staff, day);
}
