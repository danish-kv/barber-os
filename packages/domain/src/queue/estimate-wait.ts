// Queue rules. Ported verbatim from Demo V1's queueForBranch() estimation
// loop in lib/selectors.ts. Two proven rules live here:
//
// 1. THE ANCHOR RULE (QA-discovered): queue participation is anchored to
//    operational reality — serviceStartedAt ?? checkedInAt — never blindly
//    to the scheduled slot date. An after-hours check-in for tomorrow's slot
//    belongs in *today's* live queue.
//
// 2. WAIT ESTIMATION is a simulation: each waiting entry is assigned to its
//    preferred barber's forecast free-time (or the earliest-free chair for
//    "any barber"), accumulating service durations.

export interface QueueAnchorSource {
  start: string | Date;
  checkedInAt?: string | Date | null;
  serviceStartedAt?: string | Date | null;
}

/** The QA-proven anchor: when did this appointment actually enter the shop's
 * operational timeline? */
export function queueAnchor(a: QueueAnchorSource): Date {
  return new Date(a.serviceStartedAt ?? a.checkedInAt ?? a.start);
}

export interface StaffFreeState {
  staffId: string;
  /** ms epoch at which this staff member becomes free.
   * Staff on break/leave/off are simply omitted by the caller. */
  freeAtMs: number;
}

export interface WaitingForEstimate {
  id: string;
  /** preferred staff, or null for "any barber" */
  staffId: string | null;
  /** total service duration of this entry, minutes */
  durationMin: number;
}

/** Returns estimated wait in minutes per waiting-entry id. Mutates nothing. */
export function estimateWaits(
  staffFree: StaffFreeState[],
  waiting: WaitingForEstimate[],
  now: Date,
  fallbackWaitMin = 15
): Map<string, number> {
  const freeAt = new Map<string, number>(
    staffFree.map((s) => [s.staffId, s.freeAtMs])
  );
  const result = new Map<string, number>();

  for (const w of waiting) {
    const durMs = w.durationMin * 60000;
    let chosen: string | undefined;
    if (w.staffId && freeAt.has(w.staffId)) {
      chosen = w.staffId;
    } else {
      let best: string | undefined;
      let bestTime = Infinity;
      for (const [sid, t] of freeAt) {
        if (t < bestTime) {
          best = sid;
          bestTime = t;
        }
      }
      chosen = best;
    }
    if (chosen !== undefined) {
      const startAt = freeAt.get(chosen)!;
      result.set(
        w.id,
        Math.max(0, Math.round((startAt - now.getTime()) / 60000))
      );
      freeAt.set(chosen, startAt + durMs);
    } else {
      result.set(w.id, fallbackWaitMin);
    }
  }
  return result;
}
