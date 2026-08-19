import { describe, expect, it } from "vitest";
import {
  computeCheckoutTotals,
  maxRedeemableLoyalty,
} from "../src/index.js";

// Numbers mirror the storyline test (apps/web/scripts/storyline-test.mts):
// Haircut+Beard ₹350 + Beard Oil ₹499, Royal membership (no combo included,
// 10% product discount), redeem 100 pts, ₹50 tip, ₹100 advance.
const STORYLINE = {
  lines: [
    { kind: "service" as const, refId: "sv_haircutbeard", price: 350, qty: 1 },
    { kind: "product" as const, refId: "it_beardoil", price: 499, qty: 1 },
  ],
  membership: {
    includedServices: [
      { serviceId: "sv_haircut", qty: 4 },
      { serviceId: "sv_beardtrim", qty: 4 },
    ],
    discountPercent: 10,
    usage: { sv_haircut: 2, sv_beardtrim: 1 },
  },
  discount: 0,
  loyaltyPointsUsed: 100,
  tip: 50,
  advancePaid: 100,
};

describe("computeCheckoutTotals (math pinned by the storyline test)", () => {
  it("reproduces the storyline invoice exactly", () => {
    const t = computeCheckoutTotals(STORYLINE);
    expect(t.subtotal).toBe(849);
    expect(t.membershipDiscount).toBe(Math.round(499 * 0.1)); // 50, products only
    expect(t.loyaltyRedeemed).toBe(100);
    expect(t.totalDue).toBe(849 - 100 - 50 + 50 - 100); // 649
    expect(t.pointsEarned).toBe(Math.floor(649 / 10)); // 64
    expect(t.membershipUsageDelta).toEqual({}); // combo is not an included service
  });

  it("membership covers included services up to remaining cycle quantity", () => {
    const t = computeCheckoutTotals({
      lines: [{ kind: "service", refId: "sv_haircut", price: 250, qty: 3 }],
      membership: {
        includedServices: [{ serviceId: "sv_haircut", qty: 4 }],
        discountPercent: 10,
        usage: { sv_haircut: 2 },
      },
      discount: 0,
      loyaltyPointsUsed: 0,
      tip: 0,
      advancePaid: 0,
    });
    // 2 of 4 used → 2 remaining free; product % does not touch services
    expect(t.membershipUsageDelta).toEqual({ sv_haircut: 2 });
    expect(t.membershipDiscount).toBe(500);
    expect(t.totalDue).toBe(250);
  });

  it("keeps the demo quirk: sub-100 loyalty redemptions are ignored", () => {
    const t = computeCheckoutTotals({
      lines: [{ kind: "service", refId: "x", price: 300, qty: 1 }],
      discount: 0,
      loyaltyPointsUsed: 99,
      tip: 0,
      advancePaid: 0,
    });
    expect(t.loyaltyRedeemed).toBe(0);
    expect(t.totalDue).toBe(300);
  });

  it("floors the due amount at zero and earns points on the floored value", () => {
    const t = computeCheckoutTotals({
      lines: [{ kind: "service", refId: "x", price: 150, qty: 1 }],
      discount: 0,
      loyaltyPointsUsed: 200,
      tip: 0,
      advancePaid: 100,
    });
    expect(t.totalDue).toBe(0);
    expect(t.pointsEarned).toBe(0);
  });

  it("maxRedeemableLoyalty caps by balance and post-discount total", () => {
    expect(maxRedeemableLoyalty(420, 849, 0, 50)).toBe(400); // balance-capped (4 blocks)
    expect(maxRedeemableLoyalty(1000, 250, 0, 0)).toBe(200); // total-capped
    expect(maxRedeemableLoyalty(50, 999, 0, 0)).toBe(0);
  });
});
