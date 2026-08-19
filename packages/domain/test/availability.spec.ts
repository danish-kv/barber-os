import { describe, expect, it } from "vitest";
import {
  availableSlotsAnyStaff,
  availableSlotsForStaff,
  findGaps,
  type SchedulingContext,
  type SchedulableStaff,
} from "../src/index.js";

// Wednesday 2026-08-19 (dow=3), a normal weekday.
const DAY = new Date("2026-08-19T00:00:00");
const NOW = new Date("2026-08-18T12:00:00"); // "yesterday" → no +10min rule

const week = (over: Partial<{ off: number[] }> = {}) =>
  [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    start: "10:00",
    end: "20:00",
    off: over.off?.includes(day) ?? false,
  }));

const akhil: SchedulableStaff = {
  id: "st_a",
  workingHours: week(),
  serviceIds: ["haircut", "combo", "colour"],
};

const trainee: SchedulableStaff = {
  id: "st_t",
  workingHours: week(),
  serviceIds: ["haircut"],
};

const DURATIONS: Record<string, number> = { haircut: 30, combo: 45, colour: 90 };

function ctx(over: Partial<SchedulingContext> = {}): SchedulingContext {
  return {
    branchHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      open: "10:00",
      close: "20:00",
    })),
    busy: [],
    approvedLeave: [],
    durationOf: (svc) => svc.reduce((t, id) => t + (DURATIONS[id] ?? 0), 0),
    ...over,
  };
}

describe("availability engine (behavior ported from Demo V1)", () => {
  it("uses actual service duration, not fixed 30-min blocks", () => {
    // 90-min colour: last start must be 18:30, not 19:30.
    const slots = availableSlotsForStaff(ctx(), akhil, DAY, ["colour"], [], NOW);
    const last = slots[slots.length - 1]!;
    expect(last.start.getHours()).toBe(18);
    expect(last.start.getMinutes()).toBe(30);
  });

  it("busy intervals block exactly the overlapping starts", () => {
    // 12:00–13:00 booked; a 45-min combo cannot start 11:15–12:59.
    const c = ctx({
      busy: [
        {
          staffId: "st_a",
          start: "2026-08-19T12:00:00",
          end: "2026-08-19T13:00:00",
        },
      ],
    });
    const labels = availableSlotsForStaff(c, akhil, DAY, ["combo"], [], NOW).map(
      (s) => s.label
    );
    expect(labels).toContain("11:00 AM"); // ends 11:45, fits
    expect(labels).not.toContain("11:30 AM"); // would overlap 12:00
    expect(labels).not.toContain("12:45 PM"); // still inside busy block
    expect(labels).toContain("1:00 PM");
  });

  it("approved leave removes the whole day", () => {
    const c = ctx({
      approvedLeave: [
        { staffId: "st_a", startDate: "2026-08-19", endDate: "2026-08-19" },
      ],
    });
    expect(availableSlotsForStaff(c, akhil, DAY, ["haircut"], [], NOW)).toEqual(
      []
    );
  });

  it("any-barber only offers staff capable of every selected service", () => {
    const slots = availableSlotsAnyStaff(
      ctx(),
      [trainee, akhil],
      DAY,
      ["colour"],
      [],
      NOW
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(new Set(slots.map((s) => s.staffId))).toEqual(new Set(["st_a"]));
  });

  it("any-barber resolves each label to the first-listed free staff", () => {
    const c = ctx({
      busy: [
        {
          staffId: "st_t",
          start: "2026-08-19T10:00:00",
          end: "2026-08-19T11:00:00",
        },
      ],
    });
    const slots = availableSlotsAnyStaff(
      c,
      [trainee, akhil],
      DAY,
      ["haircut"],
      [],
      NOW
    );
    const at10 = slots.find((s) => s.label === "10:00 AM")!;
    const at11 = slots.find((s) => s.label === "11:00 AM")!;
    expect(at10.staffId).toBe("st_a"); // trainee busy → falls through
    expect(at11.staffId).toBe("st_t"); // trainee listed first wins
  });

  it("today's slots start no earlier than now + 10 minutes", () => {
    const now = new Date("2026-08-19T17:00:00");
    const slots = availableSlotsForStaff(ctx(), akhil, DAY, ["haircut"], [], now);
    expect(slots[0]!.start.getTime()).toBeGreaterThanOrEqual(
      now.getTime() + 10 * 60000
    );
  });

  it("findGaps reports open stretches ≥ 20 minutes", () => {
    const c = ctx({
      busy: [
        { staffId: "st_a", start: "2026-08-19T10:00:00", end: "2026-08-19T15:40:00" },
        { staffId: "st_a", start: "2026-08-19T16:10:00", end: "2026-08-19T20:00:00" },
      ],
    });
    const gaps = findGaps(c, akhil, DAY);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]!.minutes).toBe(30);
  });
});
