// Framework-free input shapes for the scheduling engine. Callers (the demo
// adapter today, the API's repositories later) map their own records into
// these — the engine never knows where the data came from.

export interface WorkingHoursDay {
  /** 0 = Sunday .. 6 = Saturday */
  day: number;
  /** "10:00" */
  start: string;
  /** "20:00" */
  end: string;
  off?: boolean;
}

export interface BranchHoursDay {
  day: number;
  open: string;
  close: string;
  closed?: boolean;
}

export interface SchedulableStaff {
  id: string;
  workingHours: WorkingHoursDay[];
  /** service ids this staff member can perform */
  serviceIds: string[];
}

/** An interval that consumes the staff member's capacity (an active
 * appointment in any capacity-holding status). */
export interface BusyInterval {
  staffId: string;
  /** ISO string or Date */
  start: string | Date;
  end: string | Date;
}

/** An approved leave span, dates as "yyyy-MM-dd" (inclusive). */
export interface ApprovedLeave {
  staffId: string;
  startDate: string;
  endDate: string;
}

export interface SchedulingContext {
  branchHours: BranchHoursDay[];
  /** Pre-filtered to capacity-holding statuses by the caller. */
  busy: BusyInterval[];
  approvedLeave: ApprovedLeave[];
  /** Total minutes for a selection — injected so catalog lookup stays outside. */
  durationOf: (serviceIds: string[], addonIds: string[]) => number;
  /** Slot grid in minutes. Default 15. */
  gridMinutes?: number;
}

export interface Slot {
  start: Date;
  /** "5:30 PM" */
  label: string;
  period: "morning" | "afternoon" | "evening";
  demand: "normal" | "popular" | "almost-full";
  /** resolved staff (even for "any barber" requests) */
  staffId: string;
}

export interface Gap {
  start: Date;
  end: Date;
  minutes: number;
}
