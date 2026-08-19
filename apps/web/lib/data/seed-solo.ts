// Deterministic seed for the SOLO scenario — Danish Men's Studio.
// One owner-barber, phone-created appointments, walk-ins, simple revenue.
// Everything is intentionally small: this world must feel like a real
// one-chair Kerala shop, not a trimmed enterprise.

import { addDays, addMinutes, format, startOfDay, subDays } from "date-fns";
import type {
  Appointment,
  AppointmentStatus,
  Customer,
  Invoice,
  ShiftEntry,
} from "@/lib/types";
import type { DemoData } from "./seed";
import { Rng } from "./rng";
import { fullName, keralaPhone, avatarTone } from "./kerala-names";
import {
  SOLO_BRANCH,
  SOLO_BUSINESS,
  SOLO_CONFIG,
  SOLO_OWNER_STAFF,
  SOLO_SERVICES,
} from "./seed-scenarios";

const svc = new Map(SOLO_SERVICES.map((s) => [s.id, s]));

function at(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return addMinutes(startOfDay(day), (h ?? 0) * 60 + (m ?? 0));
}

export function buildSoloSeed(now = new Date()): DemoData {
  const rng = new Rng(7);
  const customers: Customer[] = [];
  const appointments: Appointment[] = [];
  const invoices: Invoice[] = [];
  let apptN = 0;
  let invN = 400;

  // ~28 regulars of a neighbourhood shop
  for (let i = 0; i < 28; i++) {
    const n = 500 + i;
    customers.push({
      id: `cus_${String(n)}`,
      userId: `user_cus_${n}`,
      name: fullName(n, 0.05),
      phone: rng.bool(0.8) ? keralaPhone(n) : "",
      avatarTone: avatarTone(n),
      homeBranchId: SOLO_BRANCH.id,
      preferredStaffId: SOLO_OWNER_STAFF.id,
      preferences: rng.bool(0.4) ? [rng.pick(["Machine cut", "Scissor cut", "Round beard", "No 0 blade"])] : [],
      notes: "",
      tags: rng.bool(0.5) ? ["loyal"] : [],
      joinedAt: subDays(now, rng.int(30, 700)).toISOString(),
      favoriteBranchIds: [SOLO_BRANCH.id],
      favoriteServiceIds: [rng.pick(["svs_haircut", "svs_cutbeard", "svs_beard"])],
      language: rng.bool(0.6) ? "ml" : "en",
    });
  }

  const mk = (
    day: Date,
    hhmm: string,
    serviceIds: string[],
    customer: Customer,
    status: AppointmentStatus,
    source: Appointment["source"]
  ) => {
    apptN += 1;
    const start = at(day, hhmm);
    const dur = serviceIds.reduce((t, id) => t + (svc.get(id)?.durationMin ?? 20), 0);
    const end = addMinutes(start, dur);
    const a: Appointment = {
      id: `aps_${String(apptN).padStart(4, "0")}`,
      branchId: SOLO_BRANCH.id,
      customerId: customer.id,
      staffId: SOLO_OWNER_STAFF.id,
      requestedAnyStaff: false,
      serviceIds,
      addonIds: [],
      start: start.toISOString(),
      end: end.toISOString(),
      status,
      source,
      createdAt: subDays(start, source === "phone" ? 1 : 0).toISOString(),
      paymentPreference: "pay-at-shop",
    };
    if (status === "completed") {
      a.checkedInAt = addMinutes(start, -3).toISOString();
      a.serviceStartedAt = a.start;
      a.completedAt = a.end;
      invN += 1;
      const total = serviceIds.reduce((t, id) => t + (svc.get(id)?.price ?? 0), 0);
      invoices.push({
        id: `invs_${a.id}`,
        branchId: SOLO_BRANCH.id,
        appointmentId: a.id,
        customerId: customer.id,
        lineItems: serviceIds.map((id, i) => ({
          id: `lis_${a.id}_${i}`,
          kind: "service",
          refId: id,
          name: svc.get(id)?.name ?? id,
          price: svc.get(id)?.price ?? 0,
          qty: 1,
          staffId: SOLO_OWNER_STAFF.id,
        })),
        subtotal: total,
        discount: 0,
        membershipDiscount: 0,
        loyaltyRedeemed: 0,
        loyaltyPointsUsed: 0,
        tip: 0,
        tax: 0,
        total,
        paymentMethods: [{ method: rng.bool(0.6) ? "cash" : "upi", amount: total }],
        status: "paid",
        createdAt: a.end,
        createdBy: "owner",
        receiptNumber: `DM-${invN}`,
      });
    } else if (status === "in-service") {
      a.checkedInAt = addMinutes(start, -2).toISOString();
      a.serviceStartedAt = a.start;
    } else if (status === "waiting") {
      a.checkedInAt = a.start;
      a.estimatedWaitMin = 15;
    }
    appointments.push(a);
    return a;
  };

  // 14 days of history: 6–9 customers/day, mostly walk-ins + phone bookings.
  for (let d = 14; d >= 1; d--) {
    const day = subDays(startOfDay(now), d);
    if (day.getDay() === 1) continue; // Monday off
    const slots = ["09:20", "10:00", "10:40", "11:30", "12:10", "15:00", "16:20", "17:10", "18:00", "19:00"];
    const count = rng.int(6, 9);
    for (let i = 0; i < count && i < slots.length; i++) {
      mk(
        day,
        slots[i],
        rng.pickWeighted([
          [["svs_haircut"], 5],
          [["svs_cutbeard"], 3],
          [["svs_beard"], 2],
          [["svs_kids"], 1],
        ]),
        rng.pick(customers),
        "completed",
        rng.bool(0.55) ? "walk-in" : "phone"
      );
    }
  }

  // Today: a believable in-progress day (when open).
  const today = startOfDay(now);
  const isMonday = now.getDay() === 1;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (!isMonday) {
    const plan: Array<[string, string[], Appointment["source"]]> = [
      ["09:30", ["svs_haircut"], "phone"],
      ["10:15", ["svs_cutbeard"], "walk-in"],
      ["11:10", ["svs_haircut"], "walk-in"],
      ["12:00", ["svs_beard"], "phone"],
      ["15:15", ["svs_haircut"], "phone"],
      ["16:30", ["svs_kids"], "walk-in"],
      ["17:20", ["svs_cutbeard"], "phone"],
      ["18:30", ["svs_haircut"], "phone"],
      ["19:30", ["svs_haircut"], "phone"],
    ];
    for (const [hhmm, ids, source] of plan) {
      const start = at(today, hhmm);
      const dur = ids.reduce((t, id) => t + (svc.get(id)?.durationMin ?? 20), 0);
      const endMin = start.getHours() * 60 + start.getMinutes() + dur;
      let status: AppointmentStatus;
      if (endMin <= nowMin) status = "completed";
      else if (start.getHours() * 60 + start.getMinutes() <= nowMin) status = "in-service";
      else status = "confirmed";
      mk(today, hhmm, ids, rng.pick(customers), status, source);
    }
    // Live queue: one walk-in waiting (during open hours only)
    if (nowMin >= 9 * 60 && nowMin <= 20 * 60) {
      const c = rng.pick(customers);
      mk(today, format(now, "HH:mm"), ["svs_haircut"], c, "waiting", "walk-in");
    }
  }

  // Tomorrow: two phone bookings already taken
  const tomorrow = addDays(today, 1);
  if (tomorrow.getDay() !== 1) {
    mk(tomorrow, "10:00", ["svs_cutbeard"], rng.pick(customers), "confirmed", "phone");
    mk(tomorrow, "17:30", ["svs_haircut"], rng.pick(customers), "confirmed", "phone");
  }

  const shifts: ShiftEntry[] = [];
  for (let o = -7; o <= 7; o++) {
    const d = addDays(now, o);
    shifts.push({
      id: `shs_${o + 7}`,
      staffId: SOLO_OWNER_STAFF.id,
      date: format(d, "yyyy-MM-dd"),
      status: d.getDay() === 1 ? "off" : "working",
      start: d.getDay() === 1 ? undefined : "09:00",
      end: d.getDay() === 1 ? undefined : d.getDay() === 0 ? "13:00" : "20:30",
    });
  }

  return {
    seededAt: now.toISOString(),
    scenario: "solo",
    businessId: SOLO_BUSINESS.id,
    branchId: SOLO_BRANCH.id,
    config: { ...SOLO_CONFIG },
    extraStaff: [],
    staffOverrides: {},
    bookingRequests: [],
    customers,
    appointments,
    invoices,
    waitlist: [],
    memberships: [],
    loyaltyAccounts: [],
    loyaltyTransactions: [],
    offers: [],
    campaigns: [],
    reviews: [],
    inventory: [],
    purchaseOrders: [],
    expenses: [
      {
        id: "exs_rent",
        branchId: SOLO_BRANCH.id,
        category: "rent",
        label: "Shop rent",
        amount: 8000,
        date: subDays(now, 4).toISOString(),
        recurring: true,
      },
      {
        id: "exs_power",
        branchId: SOLO_BRANCH.id,
        category: "electricity",
        label: "KSEB bill",
        amount: 1250,
        date: subDays(now, 6).toISOString(),
        recurring: true,
      },
    ],
    shifts,
    leaveRequests: [],
    notifications: [],
    supportTickets: [],
  };
}
