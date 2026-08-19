// Checkout math. Ported verbatim from Demo V1's store.checkout() — the exact
// arithmetic is pinned by apps/web/scripts/storyline-test.mts. This single
// implementation now serves BOTH the demo store (authoritative for the demo)
// and the POS preview (which previously duplicated it), and will serve the
// production API's /orders/preview + /orders commit.
//
// UNITS: amounts are plain numbers in the caller's unit (Demo V1: rupees;
// production: integer paise — see ../money.ts). Never mix units per call.
//
// Demo rules preserved exactly:
//  - membership covers included services up to the remaining quantity in the
//    current cycle (per-line, order-dependent), then a percentage discount on
//    PRODUCT lines only;
//  - loyalty redeems in ₹/point parity, only if at least one full 100-point
//    block is used (demo quirk kept intentionally);
//  - an already-paid advance reduces the amount due;
//  - due is floored at zero; points earned = floor(due / 10).

export interface CheckoutLine {
  kind: "service" | "product" | "addon";
  refId: string;
  price: number;
  qty: number;
}

export interface MembershipEntitlement {
  includedServices: Array<{ serviceId: string; qty: number }>;
  /** percentage discount applied to product lines */
  discountPercent: number;
  /** serviceId -> units already used this cycle */
  usage: Record<string, number>;
}

export interface CheckoutInput {
  lines: CheckoutLine[];
  membership?: MembershipEntitlement | null;
  /** manual discount amount */
  discount: number;
  /** loyalty points the operator chose to redeem */
  loyaltyPointsUsed: number;
  tip: number;
  /** advance already collected for the linked appointment, if any */
  advancePaid: number;
}

export interface CheckoutTotals {
  subtotal: number;
  membershipDiscount: number;
  /** serviceId -> included units consumed by this checkout */
  membershipUsageDelta: Record<string, number>;
  loyaltyRedeemed: number;
  advanceApplied: number;
  /** amount to collect now (≥ 0) */
  totalDue: number;
  /** loyalty points this checkout earns */
  pointsEarned: number;
}

export function computeCheckoutTotals(input: CheckoutInput): CheckoutTotals {
  const { lines, membership, discount, loyaltyPointsUsed, tip, advancePaid } =
    input;

  const subtotal = lines.reduce((s, li) => s + li.price * li.qty, 0);

  let membershipDiscount = 0;
  const usageDelta: Record<string, number> = {};
  if (membership) {
    for (const li of lines) {
      if (li.kind !== "service") continue;
      const inc = membership.includedServices.find(
        (i) => i.serviceId === li.refId
      );
      if (!inc) continue;
      const used =
        (membership.usage[li.refId] ?? 0) + (usageDelta[li.refId] ?? 0);
      const remaining = inc.qty - used;
      if (remaining > 0) {
        const freeQty = Math.min(remaining, li.qty);
        membershipDiscount += li.price * freeQty;
        usageDelta[li.refId] = (usageDelta[li.refId] ?? 0) + freeQty;
      }
    }
    const productSubtotal = lines
      .filter((li) => li.kind === "product")
      .reduce((s, li) => s + li.price * li.qty, 0);
    membershipDiscount += Math.round(
      (productSubtotal * membership.discountPercent) / 100
    );
  }

  const loyaltyRedeemed =
    Math.floor(loyaltyPointsUsed / 100) * 100 > 0 ? loyaltyPointsUsed : 0;

  const total =
    Math.max(0, subtotal - discount - membershipDiscount - loyaltyRedeemed) +
    tip -
    advancePaid;
  const totalDue = Math.max(0, total);

  return {
    subtotal,
    membershipDiscount,
    membershipUsageDelta: usageDelta,
    loyaltyRedeemed,
    advanceApplied: advancePaid,
    totalDue,
    pointsEarned: Math.floor(totalDue / 10),
  };
}

/** How many points the operator may redeem: whole 100-point blocks, capped by
 * both the customer's balance and the post-discount amount. (Demo POS rule.) */
export function maxRedeemableLoyalty(
  pointsBalance: number,
  subtotal: number,
  discount: number,
  membershipDiscount: number
): number {
  const afterDiscounts = Math.max(
    0,
    subtotal - discount - membershipDiscount
  );
  const usableBlocks = Math.min(
    Math.floor(pointsBalance / 100),
    Math.floor(afterDiscounts / 100)
  );
  return usableBlocks * 100;
}
