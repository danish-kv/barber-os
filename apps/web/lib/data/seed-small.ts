// Deterministic seed for the SMALL scenario — Brothers Hair Point.
// Owner-barber + one permanent barber + Nabeel, the temporary Onam-rush
// barber (managed by the shop, no app login, active window stamped
// relative to "now" so the contract is always live in the demo).

import { addDays, addMinutes, format, startOfDay, subDays } from "date-fns";
import type {
  Appointment,
  AppointmentStatus,
  Customer,
  Invoice,
  ShiftEntry,
  Staff,
} from "@/lib/types";
import type { DemoData } from "./seed";
import { Rng } from "./rng";
import { fullName, keralaPhone, avatarTone } from "./kerala-names";
import {
  SMALL_BRANCH,
  SMALL_BUSINESS,
  SMALL_CONFIG,
  SMALL_SERVICES,
  SMALL_STAFF,
} from "./seed-scenarios";

const svc = new Map(SMALL_SERVICES.map((s) => [s.id, s]));

function at(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return addMinutes(startOfDay(day), (h ?? 0) * 60 + (m ?? 0));
}

/** Nabeel's contract window relative to now: started 3 days ago, three weeks
 * to go — always "Active" when the demo is presented. */
export function smallTempWindow(now: Date) {
  return {
    activeFrom: format(subDays(now, 3), "yyyy-MM-dd"),
    activeUntil: format(addDays(now, 21), "yyyy-MM-dd"),
  };
}

export function buildSmallSeed(now = new Date()): DemoData {
  const rng = new Rng(11);
  const customers: Customer[] = [];
  const appointments: Appointment[] = [];
  const invoices: Invoice[] = [];
  let apptN = 0;
  let invN = 900;

  const tempWindow = smallTempWindow(now);
  const staff: Staff[] = SMALL_STAFF.map((s) =>
    s.id === "stb_nabeel" ? { ...s, ...tempWindow } : s
  );
  const [danish, sameer, nabeel] = staff as [Staff, Staff, Staff];

  for (let i = 0; i < 46; i++) {
    const n = 800 + i;
    customers.push({
      id: `cub_${n}`,
      userId: `user_cub_${n}`,
      name: fullName(n, 0.08),
      phone: rng.bool(0.85) ? keralaPhone(n) : "",
      avatarTone: avatarTone(n),
      homeBranchId: SMALL_BRANCH.id,
      preferredStaffId: rng.bool(0.5) ? danish.id : rng.bool(0.5) ? sameer.id : undefined,
      preferences: rng.bool(0.35) ? [rng.pick(["Low fade", "Side part", "Beard round", "No machine"])] : [],
      notes: "",
      tags: rng.bool(0.4) ? ["loyal"] : [],
      joinedAt: subDays(now, rng.int(20, 900)).toISOString(),
      favoriteBranchIds: [SMALL_BRANCH.id],
      favoriteServiceIds: [rng.pick(["svb_haircut", "svb_cutbeard"])],
      language: rng.bool(0.55) ? "ml" : "en",
    });
  }

  const mk = (
    day: Date,
    hhmm: string,
    serviceIds: string[],
    customer: Customer,
    staffMember: Staff,
    status: AppointmentStatus,
    source: Appointment["source"]
  ) => {
    apptN += 1;
    const start = at(day, hhmm);
    const dur = serviceIds.reduce((t, id) => t + (svc.get(id)?.durationMin ?? 20), 0);
    const end = addMinutes(start, dur);
    const a: Appointment = {
      id: `apb_${String(apptN).padStart(4, "0")}`,
      branchId: SMALL_BRANCH.id,
      customerId: customer.id,
      staffId: staffMember.id,
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
        id: `invb_${a.id}`,
        branchId: SMALL_BRANCH.id,
        appointmentId: a.id,
        customerId: customer.id,
        lineItems: serviceIds.map((id, i) => ({
          id: `lib_${a.id}_${i}`,
          kind: "service",
          refId: id,
          name: svc.get(id)?.name ?? id,
          price: svc.get(id)?.price ?? 0,
          qty: 1,
          staffId: staffMember.id,
        })),
        subtotal: total,
        discount: 0,
        membershipDiscount: 0,
        loyaltyRedeemed: 0,
        loyaltyPointsUsed: 0,
        tip: 0,
        tax: 0,
        total,
        paymentMethods: [{ method: rng.bool(0.55) ? "cash" : "upi", amount: total }],
        status: "paid",
        createdAt: a.end,
        createdBy: "owner",
        receiptNumber: `BH-${invN}`,
      });
    } else if (status === "in-service") {
      a.checkedInAt = addMinutes(start, -2).toISOString();
      a.serviceStartedAt = a.start;
    } else if (status === "waiting") {
      a.checkedInAt = a.start;
      a.estimatedWaitMin = 12;
    }
    appointments.push(a);
    return a;
  };

  const nabeelActiveOn = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    return key >= tempWindow.activeFrom && key <= tempWindow.activeUntil;
  };

  // 16 days history for Danish + Sameer (+ Nabeel inside his window)
  for (let d = 16; d >= 1; d--) {
    const day = subDays(startOfDay(now), d);
    const roster = [
      ...(day.getDay() === 2 ? [] : [danish]),
      ...(day.getDay() === 4 ? [] : [sameer]),
      ...(nabeelActiveOn(day) ? [nabeel] : []),
    ];
    const slots = ["09:30", "10:15", "11:00", "11:45", "12:30", "15:30", "16:15", "17:00", "17:45", "18:30", "19:15"];
    for (const member of roster) {
      const count = rng.int(4, 6);
      const mine = rng.shuffle(slots).slice(0, count);
      for (const hhmm of mine) {
        const eligible = SMALL_SERVICES.filter((s) => member.serviceIds.includes(s.id));
        mk(
          day,
          hhmm,
          [rng.pick(eligible).id],
          rng.pick(customers),
          member,
          "completed",
          rng.bool(0.5) ? "walk-in" : "phone"
        );
      }
    }
  }

  // Today
  const today = startOfDay(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const todayRoster = [
    ...(now.getDay() === 2 ? [] : [danish]),
    ...(now.getDay() === 4 ? [] : [sameer]),
    ...(nabeelActiveOn(now) ? [nabeel] : []),
  ];
  const todaySlots = ["09:30", "10:20", "11:10", "12:00", "15:20", "16:10", "17:00", "17:50", "18:40", "19:30"];
  for (const member of todayRoster) {
    const mine = rng.shuffle(todaySlots).slice(0, rng.int(4, 6));
    for (const hhmm of mine.sort()) {
      const start = at(today, hhmm);
      const eligible = SMALL_SERVICES.filter((s) => member.serviceIds.includes(s.id));
      const ids = [rng.pick(eligible).id];
      const dur = ids.reduce((t, id) => t + (svc.get(id)?.durationMin ?? 20), 0);
      const endMin = start.getHours() * 60 + start.getMinutes() + dur;
      let status: AppointmentStatus;
      if (endMin <= nowMin) status = "completed";
      else if (start.getHours() * 60 + start.getMinutes() <= nowMin) status = "in-service";
      else status = "confirmed";
      mk(today, hhmm, ids, rng.pick(customers), member, status, rng.bool(0.5) ? "walk-in" : "phone");
    }
  }
  if (nowMin >= 9 * 60 && nowMin <= 20 * 60 + 30) {
    mk(today, format(now, "HH:mm"), ["svb_haircut"], rng.pick(customers), danish, "waiting", "walk-in");
    const w2 = mk(today, format(now, "HH:mm"), ["svb_cutbeard"], rng.pick(customers), sameer, "waiting", "walk-in");
    w2.requestedAnyStaff = true;
    w2.staffId = null;
  }

  const shifts: ShiftEntry[] = [];
  let shN = 0;
  for (let o = -7; o <= 7; o++) {
    const d = addDays(now, o);
    const key = format(d, "yyyy-MM-dd");
    for (const member of staff) {
      shN += 1;
      const wh = member.workingHours.find((w) => w.day === d.getDay());
      const inactive =
        member.employmentType === "temporary" &&
        !(key >= tempWindow.activeFrom && key <= tempWindow.activeUntil);
      const off = inactive || !wh || wh.off;
      shifts.push({
        id: `shb_${shN}`,
        staffId: member.id,
        date: key,
        status: off ? "off" : "working",
        start: off ? undefined : wh?.start,
        end: off ? undefined : wh?.end,
      });
    }
  }

  return {
    seededAt: now.toISOString(),
    scenario: "small",
    businessId: SMALL_BUSINESS.id,
    branchId: SMALL_BRANCH.id,
    config: { ...SMALL_CONFIG },
    extraStaff: [],
    // Static seed staff carry no dates; Nabeel's live contract window is a
    // runtime override so selectors (roster/availability/queue) enforce it.
    staffOverrides: { stb_nabeel: { ...tempWindow } },
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
      { id: "exb_rent", branchId: SMALL_BRANCH.id, category: "rent", label: "Shop rent", amount: 15000, date: subDays(now, 5).toISOString(), recurring: true },
      { id: "exb_power", branchId: SMALL_BRANCH.id, category: "electricity", label: "KSEB bill", amount: 2400, date: subDays(now, 8).toISOString(), recurring: true },
      { id: "exb_supplies", branchId: SMALL_BRANCH.id, category: "consumables", label: "Blades & supplies", amount: 1800, date: subDays(now, 3).toISOString() },
    ],
    shifts,
    leaveRequests: [],
    notifications: [],
    supportTickets: [],
  };
}
