import { z } from "zod";

/** UUID entity id. */
export const Id = z.string().uuid();

/** ISO 8601 datetime with offset, e.g. "2026-08-21T17:30:00+05:30". */
export const IsoDateTime = z.string().datetime({ offset: true });

/** Calendar date "yyyy-MM-dd". */
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** E.164 phone number. */
export const PhoneE164 = z.string().regex(/^\+[1-9]\d{6,14}$/);

/** Money is ALWAYS integer paise in contracts, and fields are named
 * explicitly (`amountPaise`, `totalPaise`) — never a bare `amount`. */
export const AmountPaise = z.number().int().min(0);

/** Signed paise for ledger deltas. */
export const DeltaPaise = z.number().int();
