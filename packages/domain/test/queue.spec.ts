import { describe, expect, it } from "vitest";
import { estimateWaits, queueAnchor } from "../src/index.js";

describe("queueAnchor (the QA-discovered rule)", () => {
  it("anchors to check-in when the booked slot is tomorrow", () => {
    const a = queueAnchor({
      start: "2026-08-20T17:30:00",
      checkedInAt: "2026-08-19T19:05:00",
    });
    expect(a.getDate()).toBe(19); // today's queue, not tomorrow's slot date
  });

  it("prefers service start over check-in, and slot start as last resort", () => {
    expect(
      queueAnchor({
        start: "2026-08-20T17:30:00",
        checkedInAt: "2026-08-19T19:05:00",
        serviceStartedAt: "2026-08-19T19:20:00",
      }).getMinutes()
    ).toBe(20);
    expect(queueAnchor({ start: "2026-08-20T17:30:00" }).getDate()).toBe(20);
  });
});

describe("estimateWaits (simulation ported from queueForBranch)", () => {
  const now = new Date("2026-08-19T17:00:00");
  const min = (m: number) => now.getTime() + m * 60000;

  it("preferred-barber entries queue behind that barber's current service", () => {
    const waits = estimateWaits(
      [
        { staffId: "A", freeAtMs: min(18) }, // serving, 18 min left
        { staffId: "B", freeAtMs: min(0) }, // free
      ],
      [
        { id: "w1", staffId: "A", durationMin: 30 },
        { id: "w2", staffId: "A", durationMin: 30 },
      ],
      now
    );
    expect(waits.get("w1")).toBe(18);
    expect(waits.get("w2")).toBe(48); // behind w1's 30 min too
  });

  it("any-barber takes the earliest-free chair", () => {
    const waits = estimateWaits(
      [
        { staffId: "A", freeAtMs: min(18) },
        { staffId: "B", freeAtMs: min(5) },
      ],
      [{ id: "w1", staffId: null, durationMin: 30 }],
      now
    );
    expect(waits.get("w1")).toBe(5);
  });

  it("falls back when no staff is available at all", () => {
    const waits = estimateWaits(
      [],
      [{ id: "w1", staffId: null, durationMin: 30 }],
      now
    );
    expect(waits.get("w1")).toBe(15);
  });
});
