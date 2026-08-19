// Money conventions.
//
// DEMO V1 (unchanged in Phase 0A): the demo represents money as plain rupee
// `number`s — a display convention baked into seeds, storyline assertions and
// UI. Do NOT convert the demo silently.
//
// PRODUCTION: all persisted and transported money is INTEGER PAISE. Contracts
// name fields explicitly (`amountPaise`, `totalPaise`) — never a bare
// `amount`. The branded type below makes accidental unit mixing a compile
// error inside production code paths.

/** Integer paise (1/100 rupee). Branded to prevent unit mix-ups. */
export type Paise = number & { readonly __brand: "paise" };

export function paise(value: number): Paise {
  if (!Number.isInteger(value)) {
    throw new TypeError(`paise must be an integer, got ${value}`);
  }
  return value as Paise;
}

export function rupeesToPaise(rupees: number): Paise {
  return paise(Math.round(rupees * 100));
}

export function paiseToRupees(p: Paise): number {
  return p / 100;
}

export function formatPaiseINR(p: Paise): string {
  return `₹${(p / 100).toLocaleString("en-IN", {
    minimumFractionDigits: p % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
