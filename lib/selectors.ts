import {
  differenceInDays,
  format,
  isSameDay,
  startOfDay,
  subDays,
} from "date-fns";
import type {
  Appointment,
  Customer,
  Invoice,
  ServiceCategory,
  Staff,
} from "@/lib/types";
import type { DemoData } from "@/lib/data/seed";
import { BRANCHES, SERVICES, STAFF } from "@/lib/data/seed-static";

const serviceMap = new Map(SERVICES.map((s) => [s.id, s]));
const staffMap = new Map(STAFF.map((s) => [s.id, s]));

export function serviceById(id: string) {
  return serviceMap.get(id);
}
export function staffById(id: string | null | undefined) {
  return id ? staffMap.get(id) : undefined;
}
export function branchById(id: string) {
  return BRANCHES.find((b) => b.id === id);
}
export function customerById(data: DemoData, id: string) {
  return data.customers.find((c) => c.id === id);
}
export function serviceNames(serviceIds: string[]) {
  return serviceIds
    .map((id) => serviceMap.get(id)?.name)
    .filter(Boolean)
    .join(" + ");
}

function inBranch(branchFilter: string, branchId: string) {
  return branchFilter === "all" || branchFilter === branchId;
}

// ---------- Appointments ----------

export function appointmentsForDay(
  data: DemoData,
  branchFilter: string,
  day: Date
): Appointment[] {
  return data.appointments
    .filter(
      (a) =>
        inBranch(branchFilter, a.branchId) && isSameDay(new Date(a.start), day)
    )
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function upcomingForCustomer(data: DemoData, customerId: string) {
  const now = Date.now();
  return data.appointments
    .filter(
      (a) =>
        a.customerId === customerId &&
        ["confirmed", "checked-in", "waiting", "in-service"].includes(a.status) &&
        new Date(a.end).getTime() > now - 12 * 3600_000
    )
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function historyForCustomer(data: DemoData, customerId: string) {
  return data.appointments
    .filter(
      (a) =>
        a.customerId === customerId &&
        ["completed", "cancelled", "no-show"].includes(a.status)
    )
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

// ---------- Queue ----------

export interface QueueView {
  serving: Appointment[];
  waiting: Appointment[];
  /** staffId -> free | serving apptId */
  staffState: Array<{
    staff: Staff;
    state: "serving" | "free" | "break" | "off" | "leave";
    current?: Appointment;
    remainingMin?: number;
  }>;
}

export function queueForBranch(data: DemoData, branchId: string, now = new Date()): QueueView {
  const today = startOfDay(now);
  // Queue membership is anchored to when the customer actually checked in /
  // started service — not the booked slot — so an early check-in (e.g. for a
  // next-day slot) still appears in today's live queue.
  const todays = data.appointments.filter((a) => {
    if (a.branchId !== branchId) return false;
    const anchor = a.serviceStartedAt ?? a.checkedInAt ?? a.start;
    return isSameDay(new Date(anchor), today);
  });
  const serving = todays
    .filter((a) => a.status === "in-service")
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const waiting = todays
    .filter((a) => a.status === "waiting" || a.status === "checked-in")
    .sort(
      (a, b) =>
        (a.queueNumber ?? 99) - (b.queueNumber ?? 99) ||
        new Date(a.checkedInAt ?? a.start).getTime() -
          new Date(b.checkedInAt ?? b.start).getTime()
    );

  const dateKey = format(now, "yyyy-MM-dd");
  const staffState = STAFF.filter((s) => s.branchId === branchId).map((staff) => {
    const shift = data.shifts.find(
      (sh) => sh.staffId === staff.id && sh.date === dateKey
    );
    const current = serving.find((a) => a.staffId === staff.id);
    let state: QueueView["staffState"][number]["state"];
    if (shift?.status === "leave") state = "leave";
    else if (shift?.status === "off") state = "off";
    else if (shift?.status === "break") state = "break";
    else if (current) state = "serving";
    else state = "free";
    let remainingMin: number | undefined;
    if (current) {
      remainingMin = Math.max(
        1,
        Math.round((new Date(current.end).getTime() - now.getTime()) / 60000)
      );
    }
    return { staff, state, current, remainingMin };
  });

  // Estimated waits: simple simulation — assign each waiting entry to its
  // preferred barber's queue (or shortest queue for "any").
  const freeAt = new Map<string, number>();
  for (const s of staffState) {
    if (s.state === "serving" && s.current) {
      freeAt.set(s.staff.id, now.getTime() + (s.remainingMin ?? 10) * 60000);
    } else if (s.state === "free") {
      freeAt.set(s.staff.id, now.getTime());
    }
    // break/off/leave staff are excluded from wait estimation
  }
  for (const w of waiting) {
    const dur =
      w.serviceIds.reduce((t, id) => t + (serviceMap.get(id)?.durationMin ?? 30), 0) *
      60000;
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
    if (chosen) {
      const startAt = freeAt.get(chosen)!;
      w.estimatedWaitMin = Math.max(0, Math.round((startAt - now.getTime()) / 60000));
      freeAt.set(chosen, startAt + dur);
    } else {
      w.estimatedWaitMin = w.estimatedWaitMin ?? 15;
    }
  }

  return { serving, waiting, staffState };
}

// ---------- Revenue / metrics ----------

export function invoicesForRange(
  data: DemoData,
  branchFilter: string,
  from: Date,
  to: Date
): Invoice[] {
  return data.invoices.filter((inv) => {
    if (!inBranch(branchFilter, inv.branchId)) return false;
    const t = new Date(inv.createdAt).getTime();
    return t >= from.getTime() && t <= to.getTime();
  });
}

export function revenueForDay(data: DemoData, branchFilter: string, day: Date) {
  return data.invoices
    .filter(
      (inv) =>
        inBranch(branchFilter, inv.branchId) &&
        isSameDay(new Date(inv.createdAt), day)
    )
    .reduce((s, inv) => s + inv.total, 0);
}

export interface DayMetrics {
  revenue: number;
  appointments: number;
  walkIns: number;
  customers: number;
  avgTicket: number;
  completed: number;
  cancelled: number;
  noShows: number;
  noShowRate: number;
}

export function metricsForDay(
  data: DemoData,
  branchFilter: string,
  day: Date
): DayMetrics {
  const appts = data.appointments.filter(
    (a) => inBranch(branchFilter, a.branchId) && isSameDay(new Date(a.start), day)
  );
  const invoices = data.invoices.filter(
    (inv) =>
      inBranch(branchFilter, inv.branchId) &&
      isSameDay(new Date(inv.createdAt), day)
  );
  const revenue = invoices.reduce((s, i) => s + i.total, 0);
  const walkIns = appts.filter((a) => a.source === "walk-in").length;
  const completed = appts.filter((a) => a.status === "completed").length;
  const cancelled = appts.filter((a) => a.status === "cancelled").length;
  const noShows = appts.filter((a) => a.status === "no-show").length;
  const customers = new Set(appts.map((a) => a.customerId)).size;
  return {
    revenue,
    appointments: appts.length,
    walkIns,
    customers,
    avgTicket: invoices.length ? Math.round(revenue / invoices.length) : 0,
    completed,
    cancelled,
    noShows,
    noShowRate: appts.length ? noShows / appts.length : 0,
  };
}

export function revenueTrend(
  data: DemoData,
  branchFilter: string,
  days: number,
  now = new Date()
) {
  const out: Array<{ date: string; label: string; revenue: number; bookings: number }> = [];
  for (let d = days - 1; d >= 0; d--) {
    const day = subDays(startOfDay(now), d);
    const revenue = revenueForDay(data, branchFilter, day);
    const bookings = data.appointments.filter(
      (a) =>
        inBranch(branchFilter, a.branchId) &&
        isSameDay(new Date(a.start), day) &&
        a.status !== "cancelled"
    ).length;
    out.push({
      date: format(day, "yyyy-MM-dd"),
      label: format(day, "d MMM"),
      revenue,
      bookings,
    });
  }
  return out;
}

// ---------- Staff performance ----------

export interface StaffPerformance {
  staff: Staff;
  services: number;
  revenue: number;
  commission: number;
  utilization: number;
  avgTicket: number;
}

function commissionRate(staff: Staff, category: ServiceCategory | "product") {
  const rule =
    staff.commissionRules.find((r) => r.serviceCategory === category) ??
    staff.commissionRules.find((r) => r.serviceCategory === "default");
  return rule?.rate ?? 0.2;
}

export function commissionForInvoice(inv: Invoice, staffId: string) {
  let total = 0;
  for (const li of inv.lineItems) {
    if (li.staffId !== staffId && !(li.kind !== "product" && !li.staffId)) continue;
    const staff = staffMap.get(staffId);
    if (!staff) continue;
    if (li.kind === "product") {
      total += li.price * li.qty * commissionRate(staff, "product");
    } else {
      const svc = serviceMap.get(li.refId);
      const cat = svc?.category ?? "hair";
      total += li.price * li.qty * commissionRate(staff, cat);
    }
  }
  return Math.round(total);
}

export function staffPerformance(
  data: DemoData,
  branchFilter: string,
  from: Date,
  to: Date
): StaffPerformance[] {
  const staffList = STAFF.filter((s) => inBranch(branchFilter, s.branchId));
  const invoices = invoicesForRange(data, branchFilter, from, to);
  const rangeDays = Math.max(1, differenceInDays(to, from) + 1);

  return staffList
    .map((staff) => {
      let revenue = 0;
      let commission = 0;
      let services = 0;
      for (const inv of invoices) {
        const mine = inv.lineItems.filter((li) => li.staffId === staff.id);
        if (mine.length === 0) continue;
        revenue += mine.reduce((s, li) => s + li.price * li.qty, 0);
        commission += commissionForInvoice(inv, staff.id);
        services += mine.filter((li) => li.kind === "service").length;
      }
      // Utilization: booked minutes vs available minutes over the range.
      let bookedMin = 0;
      for (const a of data.appointments) {
        if (a.staffId !== staff.id) continue;
        if (!["completed", "in-service", "confirmed"].includes(a.status)) continue;
        const t = new Date(a.start).getTime();
        if (t < from.getTime() || t > to.getTime()) continue;
        bookedMin += Math.round(
          (new Date(a.end).getTime() - new Date(a.start).getTime()) / 60000
        );
      }
      const workMinPerDay = 8 * 60;
      const utilization = Math.min(
        1,
        bookedMin / (rangeDays * workMinPerDay * 0.86)
      );
      return {
        staff,
        services,
        revenue: Math.round(revenue),
        commission,
        utilization,
        avgTicket: services ? Math.round(revenue / services) : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

// ---------- Service popularity ----------

export function servicePopularity(
  data: DemoData,
  branchFilter: string,
  from: Date,
  to: Date
) {
  const counts = new Map<string, { bookings: number; revenue: number }>();
  for (const inv of invoicesForRange(data, branchFilter, from, to)) {
    for (const li of inv.lineItems) {
      if (li.kind !== "service") continue;
      const cur = counts.get(li.refId) ?? { bookings: 0, revenue: 0 };
      cur.bookings += li.qty;
      cur.revenue += li.price * li.qty;
      counts.set(li.refId, cur);
    }
  }
  return [...counts.entries()]
    .map(([serviceId, v]) => ({
      service: serviceMap.get(serviceId),
      serviceId,
      ...v,
    }))
    .filter((e) => e.service)
    .sort((a, b) => b.revenue - a.revenue);
}

// ---------- Customer insights ----------

export interface CustomerStats {
  customer: Customer;
  visits: number;
  lifetimeSpend: number;
  lastVisit?: string;
  daysSinceVisit?: number;
}

export function customerStats(data: DemoData, customerId: string): CustomerStats | null {
  const customer = data.customers.find((c) => c.id === customerId);
  if (!customer) return null;
  const completed = data.appointments.filter(
    (a) => a.customerId === customerId && a.status === "completed"
  );
  const spend = data.invoices
    .filter((i) => i.customerId === customerId)
    .reduce((s, i) => s + i.total, 0);
  const last = completed
    .map((a) => a.completedAt ?? a.end)
    .sort()
    .at(-1);
  return {
    customer,
    visits: completed.length,
    lifetimeSpend: Math.round(spend),
    lastVisit: last,
    daysSinceVisit: last
      ? differenceInDays(new Date(), new Date(last))
      : undefined,
  };
}

export function allCustomerStats(data: DemoData, branchFilter: string): CustomerStats[] {
  return data.customers
    .filter((c) => inBranch(branchFilter, c.homeBranchId))
    .map((c) => customerStats(data, c.id)!)
    .filter(Boolean);
}

export function customerSegments(data: DemoData, branchFilter: string) {
  const stats = allCustomerStats(data, branchFilter);
  const now = new Date();
  const newCustomers = stats.filter(
    (s) => differenceInDays(now, new Date(s.customer.joinedAt)) <= 30
  );
  const returning = stats.filter((s) => s.visits >= 2);
  const inactive30 = stats.filter((s) => (s.daysSinceVisit ?? 999) > 30 && s.visits > 0);
  const inactive60 = stats.filter((s) => (s.daysSinceVisit ?? 999) > 60 && s.visits > 0);
  const vip = stats.filter((s) => s.customer.tags.includes("vip") || s.lifetimeSpend > 5000);
  return { all: stats, newCustomers, returning, inactive30, inactive60, vip };
}

// ---------- Inventory ----------

export function lowStockItems(data: DemoData, branchFilter: string) {
  return data.inventory.filter(
    (i) => inBranch(branchFilter, i.branchId) && i.quantity <= i.minQuantity
  );
}

// ---------- Insights (deterministic "intelligence") ----------

export interface Insight {
  id: string;
  kind: "opportunity" | "risk" | "info";
  title: string;
  detail: string;
  actionLabel?: string;
  actionHref?: string;
}

export function businessInsights(
  data: DemoData,
  branchFilter: string,
  now = new Date()
): Insight[] {
  const insights: Insight[] = [];
  const segments = customerSegments(data, branchFilter);

  if (segments.inactive60.length > 5) {
    const est = Math.round(segments.inactive60.length * 0.2 * 700);
    insights.push({
      id: "in_winback",
      kind: "opportunity",
      title: `${segments.inactive60.length} customers haven't returned in 60+ days`,
      detail: `Sending a ₹100 return offer could generate approximately ₹${est.toLocaleString("en-IN")} if 20% return.`,
      actionLabel: "Create win-back campaign",
      actionHref: "/owner/marketing",
    });
  }

  // Weekend evening utilization
  const weekendEvening = data.appointments.filter((a) => {
    const d = new Date(a.start);
    const dow = d.getDay();
    return (
      inBranch(branchFilter, a.branchId) &&
      (dow === 6 || dow === 0) &&
      d.getHours() >= 17 &&
      a.status !== "cancelled" &&
      d.getTime() > subDays(now, 21).getTime()
    );
  }).length;
  if (weekendEvening > 12) {
    insights.push({
      id: "in_weekend",
      kind: "info",
      title: "Saturday 5–8 PM is consistently over 85% booked",
      detail:
        "Consider adding an additional barber from 5 PM–8 PM on weekends, or nudging flexible customers to off-peak slots.",
      actionLabel: "View time analysis",
      actionHref: "/owner/analytics?tab=time",
    });
  }

  const cancelled = data.appointments.filter(
    (a) =>
      inBranch(branchFilter, a.branchId) &&
      a.status === "cancelled" &&
      new Date(a.start).getTime() > subDays(now, 7).getTime()
  );
  if (cancelled.length > 2) {
    const lost = cancelled.reduce(
      (s, a) =>
        s +
        a.serviceIds.reduce((t, id) => t + (serviceMap.get(id)?.price ?? 0), 0),
      0
    );
    insights.push({
      id: "in_cancel",
      kind: "risk",
      title: `${cancelled.length} cancelled slots this week`,
      detail: `Roughly ₹${lost.toLocaleString("en-IN")} of unused capacity. Enable waitlist auto-fill to recover these slots.`,
      actionLabel: "View waitlist",
      actionHref: "/owner/queue",
    });
  }

  const low = lowStockItems(data, branchFilter);
  const beardOil = low.find((i) => i.name === "Beard Oil");
  if (beardOil) {
    insights.push({
      id: "in_beardoil",
      kind: "risk",
      title: "Beard Oil may run out within 4 days",
      detail: `${beardOil.quantity} ${beardOil.unit} left at ${branchById(beardOil.branchId)?.name}. It's also your best-margin retail product.`,
      actionLabel: "Create purchase order",
      actionHref: "/owner/purchase-orders",
    });
  }

  const pop = servicePopularity(data, branchFilter, subDays(now, 30), now);
  const colour = pop.find((p) => p.serviceId === "sv_haircolour");
  if (colour) {
    insights.push({
      id: "in_colour",
      kind: "opportunity",
      title: "Hair Colour has the highest average order value",
      detail: `₹${Math.round(colour.revenue / Math.max(1, colour.bookings)).toLocaleString("en-IN")} per visit. Promote colour consultations to your repeat haircut customers.`,
      actionLabel: "Create offer",
      actionHref: "/owner/offers",
    });
  }

  // Slowest period
  insights.push({
    id: "in_tuesday",
    kind: "info",
    title: "Tuesday morning is your lowest-utilization period",
    detail:
      "Average 34% chair utilization 10 AM–1 PM Tuesdays. An off-peak student offer could fill these hours.",
    actionLabel: "Create off-peak offer",
    actionHref: "/owner/offers",
  });

  return insights;
}

// ---------- Time analysis ----------

export function hourlyLoad(data: DemoData, branchFilter: string, now = new Date()) {
  const buckets = new Map<number, number>();
  for (let h = 10; h <= 19; h++) buckets.set(h, 0);
  for (const a of data.appointments) {
    if (!inBranch(branchFilter, a.branchId)) continue;
    if (a.status === "cancelled") continue;
    const d = new Date(a.start);
    if (d.getTime() < subDays(now, 21).getTime()) continue;
    const h = d.getHours();
    if (buckets.has(h)) buckets.set(h, (buckets.get(h) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([hour, count]) => ({
    hour,
    label: format(new Date(2026, 0, 1, hour), "h a"),
    count,
  }));
}

export function dailyLoad(data: DemoData, branchFilter: string, now = new Date()) {
  const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets = new Array(7).fill(0);
  for (const a of data.appointments) {
    if (!inBranch(branchFilter, a.branchId)) continue;
    if (a.status === "cancelled") continue;
    const d = new Date(a.start);
    if (d.getTime() < subDays(now, 21).getTime() || d.getTime() > now.getTime())
      continue;
    buckets[d.getDay()] += 1;
  }
  return buckets.map((count, i) => ({ dow: dows[i], count }));
}

// ---------- Expenses / profit ----------

export function expenseSummary(
  data: DemoData,
  branchFilter: string,
  from: Date,
  to: Date
) {
  const byCategory = new Map<string, number>();
  let total = 0;
  for (const e of data.expenses) {
    if (!inBranch(branchFilter, e.branchId)) continue;
    const t = new Date(e.date).getTime();
    if (t < from.getTime() || t > to.getTime()) continue;
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
    total += e.amount;
  }
  return { byCategory, total };
}

// ---------- Reviews ----------

export function reviewSummary(data: DemoData, branchFilter: string) {
  const reviews = data.reviews.filter((r) => inBranch(branchFilter, r.branchId));
  if (reviews.length === 0)
    return { count: 0, overall: 0, service: 0, cleanliness: 0, wait: 0, staff: 0 };
  const avg = (fn: (r: (typeof reviews)[number]) => number) =>
    Math.round((reviews.reduce((s, r) => s + fn(r), 0) / reviews.length) * 10) / 10;
  return {
    count: reviews.length,
    overall: avg((r) => r.ratingOverall),
    service: avg((r) => r.ratingService),
    cleanliness: avg((r) => r.ratingCleanliness),
    wait: avg((r) => r.ratingWait),
    staff: avg((r) => r.ratingStaff),
  };
}
