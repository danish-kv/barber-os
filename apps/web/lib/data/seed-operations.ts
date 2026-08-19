import { addDays, addMinutes, format, getDay, startOfDay, subDays } from "date-fns";
import type {
  Appointment,
  AppointmentStatus,
  Customer,
  Invoice,
  InvoiceLineItem,
  Membership,
  PaymentMethod,
  WaitlistEntry,
} from "@/lib/types";
import { Rng } from "./rng";
import { BRANCHES, SERVICES, ADDONS, STAFF } from "./seed-static";
import type { HeroCustomerIds } from "./seed-customers";

const GRID_MIN = 15;
const serviceMap = new Map(SERVICES.map((s) => [s.id, s]));
const addonMap = new Map(ADDONS.map((a) => [a.id, a]));

function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function dateAtMinutes(day: Date, min: number) {
  return addMinutes(startOfDay(day), min);
}

export function nextWeekday(from: Date, targetDow: number, minAheadHours = 0) {
  let d = startOfDay(from);
  for (let i = 0; i < 14; i++) {
    if (getDay(d) === targetDow && d.getTime() >= startOfDay(from).getTime()) {
      const candidate = dateAtMinutes(d, 0);
      if (i === 0 && minAheadHours > 0 && from.getTime() > candidate.getTime()) {
        // today already matches but might be "too late" for a specific hour check upstream
      }
      return d;
    }
    d = addDays(d, 1);
  }
  return addDays(from, 7);
}

/** Pick the slot we deliberately leave open on Akhil's Kakkanad calendar so
 * the live "Customer books Haircut + Beard with Akhil" demo always has a
 * real, bookable, near-future slot regardless of what time the demo runs. */
export function pickDemoOpenSlot(now: Date) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const targetMin = 17 * 60 + 30; // 5:30 PM
  if (nowMin < targetMin - 30) {
    return { date: startOfDay(now), minutes: targetMin };
  }
  if (nowMin < 19 * 60) {
    const rounded = Math.ceil((nowMin + 45) / GRID_MIN) * GRID_MIN;
    return { date: startOfDay(now), minutes: Math.min(rounded, 19 * 60 + 30) };
  }
  return { date: addDays(startOfDay(now), 1), minutes: targetMin };
}

export function pickWaitlistSlot(now: Date) {
  // Nearest upcoming Saturday, 6:00 PM — deliberately fully booked.
  let d = startOfDay(now);
  for (let i = 0; i < 8; i++) {
    if (getDay(d) === 6 && (i > 0 || now.getHours() < 18)) {
      return { date: d, minutes: 18 * 60 };
    }
    d = addDays(d, 1);
  }
  return { date: addDays(startOfDay(now), 6), minutes: 18 * 60 };
}

interface BuildArgs {
  rng: Rng;
  now: Date;
  customers: Customer[];
  heroIds: HeroCustomerIds;
}

interface DayCtx {
  date: Date;
  dow: number;
  relation: "past" | "today" | "future";
  branchId: string;
}

function statusForWindow(
  slotStart: Date,
  slotEnd: Date,
  now: Date,
  relation: DayCtx["relation"],
  rng: Rng
): AppointmentStatus {
  if (relation === "past") {
    return rng.pickWeighted([
      ["completed", 90],
      ["no-show", 5],
      ["cancelled", 5],
    ]);
  }
  if (relation === "future") {
    return rng.pickWeighted([
      ["confirmed", 96],
      ["cancelled", 4],
    ]);
  }
  // today
  if (slotEnd.getTime() <= now.getTime()) {
    return rng.pickWeighted([
      ["completed", 92],
      ["no-show", 4],
      ["cancelled", 4],
    ]);
  }
  if (slotStart.getTime() <= now.getTime() && now.getTime() < slotEnd.getTime()) {
    return "in-service";
  }
  return "confirmed";
}

function paymentMix(rng: Rng): PaymentMethod {
  return rng.pickWeighted([
    ["upi", 55],
    ["cash", 28],
    ["card", 12],
    ["wallet", 5],
  ]);
}

function buildLineItems(serviceIds: string[], addonIds: string[]): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = [];
  serviceIds.forEach((id, i) => {
    const s = serviceMap.get(id);
    if (!s) return;
    items.push({ id: `li_sv_${id}_${i}`, kind: "service", refId: id, name: s.name, price: s.price, qty: 1 });
  });
  addonIds.forEach((id, i) => {
    const a = addonMap.get(id);
    if (!a) return;
    items.push({ id: `li_ad_${id}_${i}`, kind: "addon", refId: id, name: a.name, price: a.price, qty: 1 });
  });
  return items;
}

let invoiceCounter = 1000;
function makeInvoice(
  appt: Appointment,
  staffId: string,
  rng: Rng,
  membershipDiscountPct = 0
): Invoice {
  invoiceCounter += 1;
  const lineItems = buildLineItems(appt.serviceIds, appt.addonIds).map((li) => ({
    ...li,
    staffId,
  }));
  const subtotal = lineItems.reduce((s, li) => s + li.price * li.qty, 0);
  const membershipDiscount = Math.round(subtotal * membershipDiscountPct);
  const tip = rng.bool(0.3) ? rng.pick([20, 30, 50, 100]) : 0;
  const total = Math.max(0, subtotal - membershipDiscount) + tip;
  const method = appt.advancePaid ? paymentMix(rng) : paymentMix(rng);
  return {
    id: `inv_${appt.id}`,
    branchId: appt.branchId,
    appointmentId: appt.id,
    customerId: appt.customerId,
    lineItems,
    subtotal,
    discount: 0,
    membershipDiscount,
    loyaltyRedeemed: 0,
    loyaltyPointsUsed: 0,
    tip,
    tax: 0,
    total,
    paymentMethods: [{ method, amount: total }],
    status: "paid",
    createdAt: appt.completedAt ?? appt.end,
    createdBy: "system-seed",
    receiptNumber: `RC-${invoiceCounter}`,
  };
}

function pickServices(rng: Rng, staffServiceIds: string[]): string[] {
  const weighted: Array<[string, number]> = staffServiceIds.map((id) => {
    const s = serviceMap.get(id);
    return [id, s?.popular ? 3 : 1];
  });
  const primary = rng.pickWeighted(weighted);
  if (primary === "sv_haircut" && rng.bool(0.28) && staffServiceIds.includes("sv_beardtrim")) {
    return ["sv_haircut"]; // keep single; combo already exists as its own service
  }
  return [primary];
}

let apptCounter = 0;
function nextApptId() {
  apptCounter += 1;
  return `ap_${String(apptCounter).padStart(5, "0")}`;
}

export function buildOperations({ rng, now, customers, heroIds }: BuildArgs) {
  // Reset module counters so back-to-back builds produce identical ids —
  // the seed's determinism guarantee covers ids, not just content.
  apptCounter = 0;
  invoiceCounter = 1000;
  const appointments: Appointment[] = [];
  const invoices: Invoice[] = [];
  const waitlist: WaitlistEntry[] = [];

  const heroSet = new Set(Object.values(heroIds));
  const poolByBranch = new Map<string, Customer[]>();
  const dormantByBranch = new Map<string, Customer[]>();
  for (const b of BRANCHES) {
    const all = customers.filter(
      (c) => c.homeBranchId === b.id && !heroSet.has(c.id)
    );
    // ~1 in 4 customers only has legacy visits — powers the "haven't
    // returned in 60+ days" win-back storyline with real data.
    const dormant: Customer[] = [];
    const active: Customer[] = [];
    for (const c of all) {
      (rng.bool(0.24) && new Date(c.joinedAt) < subDays(now, 90) ? dormant : active).push(c);
    }
    poolByBranch.set(b.id, active);
    dormantByBranch.set(b.id, dormant);
  }

  const demoOpenSlot = pickDemoOpenSlot(now);
  const waitlistSlot = pickWaitlistSlot(now);

  const HIST_DAYS = 32; // cover the full 30-day analytics window
  const FUTURE_DAYS = 6;

  for (const branch of BRANCHES) {
    const branchStaff = STAFF.filter((s) => s.branchId === branch.id);
    const pool = poolByBranch.get(branch.id) ?? [];
    if (pool.length === 0) continue;

    for (let offset = -HIST_DAYS; offset <= FUTURE_DAYS; offset++) {
      const date = addDays(startOfDay(now), offset);
      const dow = getDay(date);
      const relation: DayCtx["relation"] = offset < 0 ? "past" : offset === 0 ? "today" : "future";
      const isBusyDay = dow === 5 || dow === 6 || dow === 0;

      for (const staff of branchStaff) {
        const wh = staff.workingHours.find((w) => w.day === dow);
        if (!wh || wh.off) continue;
        const startMin = hhmmToMinutes(wh.start);
        const endMin = hhmmToMinutes(wh.end);

        const occupied: boolean[] = new Array(
          Math.ceil((endMin - startMin) / GRID_MIN)
        ).fill(false);

        const blockCell = (min: number, span: number) => {
          const startIdx = Math.floor((min - startMin) / GRID_MIN);
          const cells = Math.ceil(span / GRID_MIN);
          for (let c = startIdx; c < startIdx + cells && c < occupied.length; c++) {
            if (c >= 0) occupied[c] = true;
          }
        };

        const isReservedOpen =
          staff.id === "st_akhil" &&
          branch.id === "br_kakkanad" &&
          date.getTime() === demoOpenSlot.date.getTime();
        if (isReservedOpen) {
          blockCell(demoOpenSlot.minutes, 60);
        }

        const isWaitlistDay =
          staff.id === "st_akhil" &&
          branch.id === "br_kakkanad" &&
          date.getTime() === waitlistSlot.date.getTime();
        if (isWaitlistDay) {
          // Force-book the 6 PM Saturday slot so it reads as fully booked.
          const cust = rng.pick(pool);
          const serviceIds = ["sv_haircutbeard"];
          const dur = serviceIds.reduce((s, id) => s + (serviceMap.get(id)?.durationMin ?? 30), 0);
          const start = dateAtMinutes(date, waitlistSlot.minutes);
          const end = addMinutes(start, dur);
          const status = statusForWindow(start, end, now, relation, rng);
          const appt = buildApptRecord({
            branch: branch.id,
            staffId: staff.id,
            customer: cust,
            serviceIds,
            addonIds: [],
            start,
            end,
            status,
            source: "online",
            rng,
          });
          appointments.push(appt);
          if (appt.status === "completed") invoices.push(makeInvoice(appt, staff.id, rng));
          blockCell(waitlistSlot.minutes, dur);
        }

        const baseTarget = isBusyDay ? rng.int(5, 8) : rng.int(3, 6);
        const target = staff.role === "trainee" ? Math.max(2, baseTarget - 2) : baseTarget;

        let attempts = 0;
        let placed = 0;
        while (placed < target && attempts < target * 6) {
          attempts++;
          const serviceIds = pickServices(rng, staff.serviceIds);
          const dur = serviceIds.reduce((s, id) => s + (serviceMap.get(id)?.durationMin ?? 30), 0);
          const cellSpan = Math.ceil(dur / GRID_MIN);
          const maxStartIdx = occupied.length - cellSpan;
          if (maxStartIdx <= 0) break;
          const startIdx = rng.int(0, maxStartIdx);
          let free = true;
          for (let c = startIdx; c < startIdx + cellSpan; c++) {
            if (occupied[c]) {
              free = false;
              break;
            }
          }
          if (!free) continue;

          const slotMin = startMin + startIdx * GRID_MIN;
          const start = dateAtMinutes(date, slotMin);
          const end = addMinutes(start, dur);
          const status = statusForWindow(start, end, now, relation, rng);
          const addonIds =
            rng.bool(0.22) && serviceMap.get(serviceIds[0])?.addonIds.length
              ? [rng.pick(serviceMap.get(serviceIds[0])!.addonIds)]
              : [];
          const customer = rng.pick(pool);
          const source = rng.bool(0.78) ? "online" : "walk-in";

          const appt = buildApptRecord({
            branch: branch.id,
            staffId: staff.id,
            customer,
            serviceIds,
            addonIds,
            start,
            end,
            status,
            source,
            rng,
          });
          appointments.push(appt);
          if (appt.status === "completed") {
            invoices.push(makeInvoice(appt, staff.id, rng));
          }
          for (let c = startIdx; c < startIdx + cellSpan; c++) occupied[c] = true;
          placed++;
        }
      }
    }
  }

  // ---- Dormant cohort: 1–2 legacy visits 65–170 days ago, nothing since ----
  for (const branch of BRANCHES) {
    const branchStaff = STAFF.filter((s) => s.branchId === branch.id);
    for (const customer of dormantByBranch.get(branch.id) ?? []) {
      const visits = rng.int(1, 2);
      for (let v = 0; v < visits; v++) {
        const daysAgo = rng.int(65, 170) + v * rng.int(20, 40);
        const staff = rng.pick(branchStaff);
        const serviceIds = pickServices(rng, staff.serviceIds);
        const dur = serviceIds.reduce(
          (s, id) => s + (serviceMap.get(id)?.durationMin ?? 30),
          0
        );
        const start = addMinutes(
          startOfDay(subDays(now, daysAgo)),
          (11 + rng.int(0, 7)) * 60
        );
        const appt = buildApptRecord({
          branch: branch.id,
          staffId: staff.id,
          customer,
          serviceIds,
          addonIds: [],
          start,
          end: addMinutes(start, dur),
          status: "completed",
          source: rng.bool(0.6) ? "walk-in" : "online",
          rng,
        });
        appointments.push(appt);
        invoices.push(makeInvoice(appt, staff.id, rng));
      }
    }
  }

  // ---- Hand-authored storyline: Danish's rich history at Kakkanad w/ Akhil ----
  const danishOffsets: Array<{ days: number; serviceIds: string[]; addonIds?: string[] }> = [
    { days: 400, serviceIds: ["sv_haircutbeard"] },
    { days: 372, serviceIds: ["sv_haircutbeard"] },
    { days: 344, serviceIds: ["sv_haircutbeard"] },
    { days: 316, serviceIds: ["sv_premiumhaircut"] },
    { days: 288, serviceIds: ["sv_haircutbeard"] },
    { days: 260, serviceIds: ["sv_headmassage"] },
    { days: 232, serviceIds: ["sv_haircutbeard"] },
    { days: 204, serviceIds: ["sv_haircutbeard"], addonIds: ["ad_beardoil"] },
    { days: 176, serviceIds: ["sv_premiumhaircut"] },
    { days: 148, serviceIds: ["sv_haircutbeard"] },
    { days: 120, serviceIds: ["sv_haircutbeard"] },
    { days: 90, serviceIds: ["sv_haircutbeard"] },
    { days: 9, serviceIds: ["sv_haircut"] },
    { days: 7, serviceIds: ["sv_beardtrim"] },
  ];
  const danish = customers.find((c) => c.id === heroIds.danish)!;
  for (const entry of danishOffsets) {
    const date = subDays(startOfDay(now), entry.days);
    const start = dateAtMinutes(date, 11 * 60 + rng.int(0, 6) * 10);
    const dur = entry.serviceIds.reduce((s, id) => s + (serviceMap.get(id)?.durationMin ?? 30), 0);
    const end = addMinutes(start, dur);
    const appt = buildApptRecord({
      branch: "br_kakkanad",
      staffId: "st_akhil",
      customer: danish,
      serviceIds: entry.serviceIds,
      addonIds: entry.addonIds ?? [],
      start,
      end,
      status: "completed",
      source: rng.bool(0.7) ? "online" : "walk-in",
      rng,
      note: entry.days === 7 ? undefined : undefined,
    });
    appointments.push(appt);
    invoices.push(makeInvoice(appt, "st_akhil", rng, 0.1));
  }

  // ---- Arjun Nair: modest VIP history w/ Akhil ----
  const arjun = customers.find((c) => c.id === heroIds.arjun)!;
  [260, 210, 160, 110, 60, 25].forEach((days) => {
    const date = subDays(startOfDay(now), days);
    const start = dateAtMinutes(date, 12 * 60 + rng.int(0, 4) * 15);
    const serviceIds = ["sv_premiumhaircut"];
    const end = addMinutes(start, 45);
    const appt = buildApptRecord({
      branch: "br_kakkanad",
      staffId: "st_akhil",
      customer: arjun,
      serviceIds,
      addonIds: [],
      start,
      end,
      status: "completed",
      source: "online",
      rng,
    });
    appointments.push(appt);
    invoices.push(makeInvoice(appt, "st_akhil", rng));
  });

  // ---- Today's live walk-in queue (Kakkanad) ----
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const withinHours = nowMin >= 10 * 60 && nowMin <= 20 * 60;
  if (withinHours) {
    const shafi = customers.find((c) => c.id === heroIds.shafi)!;
    const neeraj = customers.find((c) => c.id === heroIds.neeraj)!;
    const walkQueue: Array<{ customer: Customer; staffId: string | null; serviceIds: string[]; waitMin: number }> = [
      { customer: shafi, staffId: null, serviceIds: ["sv_haircut"], waitMin: 8 },
      { customer: neeraj, staffId: "st_nikhil", serviceIds: ["sv_haircut"], waitMin: 18 },
    ];
    walkQueue.forEach((w, i) => {
      const start = now;
      const dur = w.serviceIds.reduce((s, id) => s + (serviceMap.get(id)?.durationMin ?? 30), 0);
      const end = addMinutes(start, dur);
      const appt = buildApptRecord({
        branch: "br_kakkanad",
        staffId: w.staffId,
        customer: w.customer,
        serviceIds: w.serviceIds,
        addonIds: [],
        start,
        end,
        status: "waiting",
        source: "walk-in",
        rng,
      });
      appt.queueNumber = i + 1;
      appt.estimatedWaitMin = w.waitMin;
      appt.checkedInAt = now.toISOString();
      appointments.push(appt);
    });
  }

  // ---- Waitlist example: another customer wants Akhil's booked Saturday slot ----
  const waitlistCustomerPool = poolByBranch.get("br_kakkanad") ?? [];
  if (waitlistCustomerPool.length) {
    const c = rng.pick(waitlistCustomerPool);
    waitlist.push({
      id: "wl_0001",
      branchId: "br_kakkanad",
      customerId: c.id,
      staffId: "st_akhil",
      serviceIds: ["sv_haircutbeard"],
      desiredDate: format(waitlistSlot.date, "yyyy-MM-dd"),
      desiredWindow: "6:00 PM",
      createdAt: subDays(now, 1).toISOString(),
      status: "open",
    });
  }

  return { appointments, invoices, waitlist };
}

function buildApptRecord(args: {
  branch: string;
  staffId: string | null;
  customer: Customer;
  serviceIds: string[];
  addonIds: string[];
  start: Date;
  end: Date;
  status: AppointmentStatus;
  source: Appointment["source"];
  rng: Rng;
  note?: string;
}): Appointment {
  const { branch, staffId, customer, serviceIds, addonIds, start, end, status, source, rng, note } = args;
  const id = nextApptId();
  const advance = rng.bool(0.4);
  const appt: Appointment = {
    id,
    branchId: branch,
    customerId: customer.id,
    staffId,
    requestedAnyStaff: staffId === null,
    serviceIds,
    addonIds,
    start: start.toISOString(),
    end: end.toISOString(),
    status,
    source,
    createdAt: subDays(start, rng.int(0, 5)).toISOString(),
    paymentPreference: advance ? "advance" : source === "walk-in" ? "pay-at-shop" : "full",
    advanceAmount: advance ? 100 : undefined,
    advancePaid: advance,
    note,
  };
  if (status === "completed") {
    appt.checkedInAt = subMinutesIso(start, rng.int(2, 8));
    appt.serviceStartedAt = start.toISOString();
    appt.completedAt = end.toISOString();
  } else if (status === "in-service") {
    appt.checkedInAt = subMinutesIso(start, rng.int(2, 6));
    appt.serviceStartedAt = start.toISOString();
  } else if (status === "cancelled") {
    appt.cancelledAt = subMinutesIso(start, rng.int(30, 600));
    appt.cancelReason = rng.pick([
      "Customer requested reschedule",
      "Barber unavailable",
      "Found closer slot elsewhere",
      "Change of plans",
    ]);
  }
  return appt;
}

function subMinutesIso(d: Date, min: number) {
  return addMinutes(d, -min).toISOString();
}

export function membershipDiscountFor(
  memberships: Membership[],
  customerId: string
): number {
  const m = memberships.find((mm) => mm.customerId === customerId && mm.status === "active");
  return m ? 0.1 : 0;
}
