import { addDays, format, subDays } from "date-fns";
import type {
  AppNotification,
  Appointment,
  Campaign,
  Customer,
  Expense,
  InventoryItem,
  Invoice,
  LeaveRequest,
  LoyaltyAccount,
  LoyaltyTransaction,
  Membership,
  Offer,
  PurchaseOrder,
  Review,
  ShiftEntry,
  SupportTicket,
} from "@/lib/types";
import { Rng } from "./rng";
import {
  BRANCHES,
  STAFF,
  PRODUCT_TEMPLATES,
  MEMBERSHIP_PLANS,
} from "./seed-static";
import type { HeroCustomerIds } from "./seed-customers";

export function buildMemberships(now: Date, heroIds: HeroCustomerIds, customers: Customer[], rng: Rng): Membership[] {
  const memberships: Membership[] = [
    {
      id: "mb_danish",
      planId: "mp_royal",
      customerId: heroIds.danish,
      branchId: "br_kakkanad",
      status: "active",
      startedAt: subDays(now, 76).toISOString(),
      renewsAt: addDays(now, 17).toISOString(),
      usage: { sv_haircut: 2, sv_beardtrim: 1 },
    },
    {
      id: "mb_arjun",
      planId: "mp_royal_plus",
      customerId: heroIds.arjun,
      branchId: "br_kakkanad",
      status: "active",
      startedAt: subDays(now, 40).toISOString(),
      renewsAt: addDays(now, 20).toISOString(),
      usage: { sv_haircutbeard: 1, sv_facial: 0, sv_headmassage: 1 },
    },
  ];
  // A few procedural members
  const pool = customers.filter(
    (c) => !Object.values(heroIds).includes(c.id) && rng.bool(0.08)
  );
  pool.slice(0, 14).forEach((c, i) => {
    const plan = rng.pick(MEMBERSHIP_PLANS);
    memberships.push({
      id: `mb_${String(i + 10).padStart(3, "0")}`,
      planId: plan.id,
      customerId: c.id,
      branchId: c.homeBranchId,
      status: rng.bool(0.85) ? "active" : "expired",
      startedAt: subDays(now, rng.int(10, 200)).toISOString(),
      renewsAt: addDays(now, rng.int(-5, 28)).toISOString(),
      usage: Object.fromEntries(
        plan.includedServices.map((inc) => [inc.serviceId, rng.int(0, inc.qty)])
      ),
    });
  });
  return memberships;
}

export function buildLoyalty(
  now: Date,
  heroIds: HeroCustomerIds,
  customers: Customer[],
  invoices: Invoice[],
  rng: Rng
) {
  const accounts: LoyaltyAccount[] = [];
  const transactions: LoyaltyTransaction[] = [];

  const spendByCustomer = new Map<string, number>();
  invoices.forEach((inv) => {
    spendByCustomer.set(inv.customerId, (spendByCustomer.get(inv.customerId) ?? 0) + inv.total);
  });

  for (const c of customers) {
    const spend = spendByCustomer.get(c.id) ?? 0;
    let points = Math.floor(spend / 10) % 500;
    let streak = rng.int(0, 6);
    if (c.id === heroIds.danish) {
      points = 420;
      streak = 5;
    }
    if (points === 0 && spend === 0) continue;
    accounts.push({
      customerId: c.id,
      points,
      tier: points > 350 ? "gold" : points > 150 ? "silver" : "bronze",
      visitStreak: streak,
    });
  }

  // Danish's visible points history
  const danishTx: Array<[number, LoyaltyTransaction["type"], number, string]> = [
    [90, "earn", 35, "Visit — Haircut + Beard"],
    [76, "bonus", 50, "Royal Membership joining bonus"],
    [60, "earn", 35, "Visit — Haircut + Beard"],
    [45, "redeem", -100, "₹100 reward redeemed"],
    [30, "earn", 35, "Visit — Haircut + Beard"],
    [9, "earn", 25, "Visit — Haircut"],
    [7, "earn", 15, "Visit — Beard Trim"],
  ];
  danishTx.forEach(([days, type, pts, reason], i) => {
    transactions.push({
      id: `lt_danish_${i}`,
      customerId: heroIds.danish,
      type,
      points: pts,
      reason,
      createdAt: subDays(now, days).toISOString(),
    });
  });

  return { accounts, transactions };
}

export function buildOffers(now: Date): Offer[] {
  return [
    {
      id: "of_monday",
      branchId: "all",
      title: "Monday Grooming",
      description: "Haircut at a special weekday price. Mondays 10 AM–2 PM.",
      serviceId: "sv_haircut",
      originalPrice: 250,
      offerPrice: 199,
      validFrom: subDays(now, 30).toISOString(),
      validTo: addDays(now, 60).toISOString(),
      windowLabel: "Mondays 10 AM–2 PM",
      audience: "all",
      active: true,
      redemptions: 46,
      code: "MONDAY199",
    },
    {
      id: "of_firstvisit",
      branchId: "all",
      title: "First Visit Offer",
      description: "20% off your first service with us.",
      discountPercent: 20,
      validFrom: subDays(now, 90).toISOString(),
      validTo: addDays(now, 90).toISOString(),
      audience: "new",
      active: true,
      redemptions: 112,
      code: "WELCOME20",
    },
    {
      id: "of_winback",
      branchId: "all",
      title: "We Miss You",
      description: "₹100 off for customers we haven't seen in 60 days.",
      discountPercent: 0,
      validFrom: subDays(now, 10).toISOString(),
      validTo: addDays(now, 30).toISOString(),
      audience: "inactive-60",
      active: true,
      redemptions: 9,
      code: "COMEBACK100",
    },
    {
      id: "of_onam",
      branchId: "all",
      title: "Onam Special",
      description: "Festive grooming combo — Haircut + Beard + Facial at ₹749.",
      offerPrice: 749,
      originalPrice: 850,
      validFrom: subDays(now, 5).toISOString(),
      validTo: addDays(now, 20).toISOString(),
      windowLabel: "Onam season",
      audience: "all",
      active: true,
      redemptions: 31,
      code: "ONAM749",
    },
    {
      id: "of_student",
      branchId: "all",
      title: "Student Tuesday",
      description: "15% off for students with valid ID. Tuesdays only.",
      discountPercent: 15,
      validFrom: subDays(now, 60).toISOString(),
      validTo: addDays(now, 120).toISOString(),
      windowLabel: "Tuesdays",
      audience: "all",
      active: false,
      redemptions: 74,
      code: "STUDENT15",
    },
  ];
}

export function buildCampaigns(now: Date): Campaign[] {
  return [
    {
      id: "cp_wemissyou",
      name: "We Miss You — August",
      channel: "whatsapp",
      audience: "inactive-60",
      audienceCount: 127,
      message:
        "Hi {name}! It's been a while since your last visit to Royal Cuts. Here's ₹100 off your next service — show code COMEBACK100. Book: royalcuts.in/book",
      offerId: "of_winback",
      status: "draft",
      estimatedCost: 95,
      estimatedRevenue: 18000,
      createdAt: subDays(now, 2).toISOString(),
    },
    {
      id: "cp_onam",
      name: "Onam Festive Push",
      channel: "whatsapp",
      audience: "all",
      audienceCount: 486,
      message:
        "Onam vibes at Royal Cuts! Haircut + Beard + Facial combo at ₹749 (save ₹101). Slots filling fast — book now: royalcuts.in/book",
      offerId: "of_onam",
      status: "sent",
      estimatedCost: 364,
      estimatedRevenue: 46000,
      createdAt: subDays(now, 6).toISOString(),
      sentAt: subDays(now, 5).toISOString(),
    },
    {
      id: "cp_birthday",
      name: "Birthday Wishes — August",
      channel: "sms",
      audience: "birthday",
      audienceCount: 23,
      message:
        "Happy birthday {name}! Celebrate with a free head massage on any service this month at Royal Cuts.",
      status: "scheduled",
      estimatedCost: 12,
      estimatedRevenue: 5500,
      createdAt: subDays(now, 1).toISOString(),
    },
  ];
}

const REVIEW_COMMENTS = [
  "Best fade in Kochi, hands down. Akhil knows exactly what I want.",
  "Clean shop, on-time appointment, zero waiting. This is how it should be.",
  "The booking app is so smooth. Paid advance on UPI, walked in, done in 40 minutes.",
  "Fathima transformed my look completely. Worth every rupee.",
  "Head massage after a long week — bliss. Will be back.",
  "Slight wait on Saturday evening but the queue tracker kept me informed.",
  "Great with kids. My son actually enjoys haircuts now!",
  "Membership is a great deal if you visit monthly. Priority booking is real.",
  "Beard trim was precise. Hot towel finish is a must-try.",
  "Good service but parking is tight during weekends.",
  "Vishnu is a perfectionist. Best senior barber in Panampilly.",
  "The wait time estimate was spot on. Loved the transparency.",
];

export function buildReviews(
  now: Date,
  customers: Customer[],
  appointments: Appointment[],
  rng: Rng
): Review[] {
  const reviews: Review[] = [];
  const completed = appointments.filter((a) => a.status === "completed" && a.staffId);
  const sample = rng.shuffle(completed).slice(0, 48);
  sample.forEach((a, i) => {
    const overall = rng.pickWeighted<number>([
      [5, 62],
      [4, 28],
      [3, 8],
      [2, 2],
    ]);
    reviews.push({
      id: `rv_${String(i).padStart(3, "0")}`,
      branchId: a.branchId,
      customerId: a.customerId,
      staffId: a.staffId ?? undefined,
      appointmentId: a.id,
      ratingOverall: overall,
      ratingService: Math.min(5, overall + (rng.bool(0.3) ? 0 : 0)),
      ratingCleanliness: Math.min(5, Math.max(3, overall + rng.int(-1, 0))),
      ratingWait: Math.min(5, Math.max(2, overall + rng.int(-1, 0))),
      ratingStaff: Math.min(5, overall),
      comment: rng.pick(REVIEW_COMMENTS),
      createdAt: a.completedAt ?? a.end,
      response:
        rng.bool(0.35) && overall >= 4
          ? "Thank you for the love! See you next time. — Team Royal Cuts"
          : overall <= 3 && rng.bool(0.7)
            ? "Sorry about the wait — we've added an extra barber for weekend evenings. Hope to serve you better next time."
            : undefined,
    });
  });
  return reviews;
}

export function buildInventory(rng: Rng): InventoryItem[] {
  const items: InventoryItem[] = [];
  for (const branch of BRANCHES) {
    for (const t of PRODUCT_TEMPLATES) {
      // Kakkanad gets the storyline low-stock items exactly as scripted.
      let qty = t.baseQty + rng.int(-2, 6);
      if (branch.id === "br_kakkanad") {
        if (t.name === "Disposable Blades") qty = 4;
        if (t.name === "Hair Wax") qty = 4;
        if (t.name === "Beard Oil") qty = 3;
        if (t.name === "Shampoo") qty = 5;
      }
      items.push({
        id: `it_${branch.id.replace("br_", "")}_${t.name.toLowerCase().replace(/[^a-z]+/g, "")}`,
        branchId: branch.id,
        name: t.name,
        category: t.category,
        unit: t.unit,
        quantity: Math.max(0, qty),
        minQuantity: t.minQuantity,
        costPrice: t.costPrice,
        sellPrice: t.sellPrice,
        sellable: t.sellable,
        vendorId: t.vendorId,
        consumedPerService: t.consumedPerService,
      });
    }
  }
  return items;
}

export function buildPurchaseOrders(now: Date, inventory: InventoryItem[]): PurchaseOrder[] {
  const blades = inventory.find((i) => i.id === "it_kakkanad_disposableblades");
  const shampoo = inventory.find((i) => i.id === "it_kakkanad_shampoo");
  const orders: PurchaseOrder[] = [];
  if (shampoo) {
    orders.push({
      id: "po_0007",
      branchId: "br_kakkanad",
      vendorId: "vd_southcoast",
      items: [{ itemId: shampoo.id, qty: 12, unitCost: shampoo.costPrice }],
      status: "received",
      createdAt: subDays(now, 12).toISOString(),
      expectedAt: subDays(now, 7).toISOString(),
      receivedAt: subDays(now, 7).toISOString(),
      total: 12 * shampoo.costPrice,
    });
  }
  if (blades) {
    orders.push({
      id: "po_0008",
      branchId: "br_kakkanad",
      vendorId: "vd_cochinmart",
      items: [{ itemId: blades.id, qty: 20, unitCost: blades.costPrice }],
      status: "ordered",
      createdAt: subDays(now, 1).toISOString(),
      expectedAt: addDays(now, 1).toISOString(),
      total: 20 * blades.costPrice,
    });
  }
  return orders;
}

export function buildExpenses(now: Date, rng: Rng): Expense[] {
  const expenses: Expense[] = [];
  let n = 0;
  const monthly: Array<[Expense["category"], string, number]> = [
    ["rent", "Shop rent", 45000],
    ["electricity", "KSEB bill", 6800],
    ["salaries", "Staff base salaries", 88000],
    ["software", "Barbershop OS subscription", 1499],
    ["marketing", "Local ads + WhatsApp campaigns", 4500],
  ];
  for (const branch of BRANCHES) {
    // current + previous month recurring
    for (const back of [0, 1, 2]) {
      const d = subDays(now, back * 30 + rng.int(0, 3));
      for (const [category, label, base] of monthly) {
        n += 1;
        const scale = branch.id === "br_kakkanad" ? 1 : rng.pick([0.7, 0.8, 0.9]);
        expenses.push({
          id: `ex_${String(n).padStart(4, "0")}`,
          branchId: branch.id,
          category,
          label,
          amount: Math.round((base * scale) / 100) * 100,
          date: d.toISOString(),
          recurring: true,
        });
      }
      // ad-hoc
      n += 1;
      expenses.push({
        id: `ex_${String(n).padStart(4, "0")}`,
        branchId: branch.id,
        category: rng.pick(["consumables", "maintenance", "misc"]),
        label: rng.pick([
          "Towel restock",
          "Chair hydraulic repair",
          "AC servicing",
          "Water cans",
          "Cleaning supplies",
        ]),
        amount: rng.int(4, 42) * 100,
        date: subDays(now, back * 30 + rng.int(2, 20)).toISOString(),
      });
    }
  }
  return expenses;
}

export function buildShiftsAndLeave(now: Date) {
  const shifts: ShiftEntry[] = [];
  const leaveRequests: LeaveRequest[] = [];

  let sn = 0;
  for (let offset = -7; offset <= 7; offset++) {
    const date = addDays(now, offset);
    const dateKey = format(date, "yyyy-MM-dd");
    const dow = date.getDay();
    for (const staff of STAFF) {
      sn += 1;
      const wh = staff.workingHours.find((w) => w.day === dow);
      let status: ShiftEntry["status"] = "working";
      if (!wh || wh.off) status = "off";
      shifts.push({
        id: `sh_${String(sn).padStart(4, "0")}`,
        staffId: staff.id,
        date: dateKey,
        status,
        start: wh?.off ? undefined : wh?.start,
        end: wh?.off ? undefined : wh?.end,
      });
    }
  }

  // Storyline: Akhil requests leave for +3 days from now (pending, manager approves in demo)
  leaveRequests.push({
    id: "lv_akhil_aug",
    staffId: "st_akhil",
    branchId: "br_kakkanad",
    startDate: format(addDays(now, 3), "yyyy-MM-dd"),
    endDate: format(addDays(now, 3), "yyyy-MM-dd"),
    reason: "Family function in Thrissur",
    status: "pending",
    requestedAt: subDays(now, 0).toISOString(),
  });
  leaveRequests.push({
    id: "lv_rahul_past",
    staffId: "st_rahul",
    branchId: "br_kakkanad",
    startDate: format(subDays(now, 6), "yyyy-MM-dd"),
    endDate: format(subDays(now, 5), "yyyy-MM-dd"),
    reason: "Medical",
    status: "approved",
    requestedAt: subDays(now, 9).toISOString(),
    decidedAt: subDays(now, 8).toISOString(),
    decidedBy: "Branch Manager",
  });
  leaveRequests.push({
    id: "lv_midhun_future",
    staffId: "st_midhun",
    branchId: "br_panampilly",
    startDate: format(addDays(now, 6), "yyyy-MM-dd"),
    endDate: format(addDays(now, 7), "yyyy-MM-dd"),
    reason: "Trip home",
    status: "pending",
    requestedAt: subDays(now, 1).toISOString(),
  });

  return { shifts, leaveRequests };
}

export function buildNotifications(now: Date): AppNotification[] {
  const minAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
  return [
    {
      id: "nt_001",
      role: "owner",
      branchId: "br_kakkanad",
      category: "staff",
      title: "Akhil requested leave",
      body: "Family function — requesting 1 day off.",
      createdAt: minAgo(2),
      read: false,
      actionLabel: "Review",
      actionHref: "/manager/leave",
    },
    {
      id: "nt_002",
      role: "receptionist",
      branchId: "br_kakkanad",
      category: "booking",
      title: "Cancellation — 6:30 PM",
      body: "A customer cancelled their 6:30 PM appointment. Slot reopened.",
      createdAt: minAgo(5),
      read: false,
      actionLabel: "View Calendar",
      actionHref: "/reception/calendar",
    },
    {
      id: "nt_003",
      role: "owner",
      branchId: "br_kakkanad",
      category: "inventory",
      title: "Low stock: Disposable Blades",
      body: "4 boxes remaining (minimum 5). PO already placed with Cochin Barber Mart.",
      createdAt: minAgo(35),
      read: false,
      actionLabel: "View Inventory",
      actionHref: "/owner/inventory",
    },
    {
      id: "nt_004",
      role: "owner",
      category: "payment",
      title: "Membership payment received",
      body: "Royal Grooming membership renewed — ₹999 via UPI.",
      createdAt: minAgo(120),
      read: true,
    },
    {
      id: "nt_005",
      role: "owner",
      category: "system",
      title: "12 customers qualify for reactivation",
      body: "They haven't visited in 60+ days. Consider a win-back campaign.",
      createdAt: minAgo(240),
      read: true,
      actionLabel: "Open Marketing",
      actionHref: "/owner/marketing",
    },
    {
      id: "nt_006",
      role: "customer",
      category: "queue",
      title: "Your 6 PM waitlist slot may open",
      body: "We'll notify you the moment a Saturday evening slot with Akhil frees up.",
      createdAt: minAgo(90),
      read: false,
    },
    {
      id: "nt_007",
      role: "barber",
      branchId: "br_kakkanad",
      category: "booking",
      title: "New booking confirmed",
      body: "You have a new appointment today. Check your schedule.",
      createdAt: minAgo(15),
      read: false,
      actionLabel: "View Schedule",
      actionHref: "/staff/schedule",
    },
    {
      id: "nt_008",
      role: "manager",
      branchId: "br_kakkanad",
      category: "staff",
      title: "Akhil requested leave for " + format(addDays(now, 3), "d MMM"),
      body: "Pending your approval.",
      createdAt: minAgo(2),
      read: false,
      actionLabel: "Review",
      actionHref: "/manager/leave",
    },
  ];
}

export function buildSupportTickets(now: Date): SupportTicket[] {
  return [
    {
      id: "tk_101",
      shopId: "shop_fadefactory",
      subject: "How do I add a second barber during trial?",
      status: "open",
      priority: "medium",
      createdAt: subDays(now, 1).toISOString(),
      lastMessage: "Trial allows 1 barber — customer asking about upgrade path.",
    },
    {
      id: "tk_102",
      shopId: "shop_fadefactory",
      subject: "WhatsApp booking link not opening",
      status: "pending",
      priority: "high",
      createdAt: subDays(now, 0).toISOString(),
      lastMessage: "Reproduced on Android 12 — fix rolling out.",
    },
    {
      id: "tk_103",
      shopId: "shop_gentlemans",
      subject: "Export monthly commission report",
      status: "open",
      priority: "low",
      createdAt: subDays(now, 3).toISOString(),
      lastMessage: "Feature request logged for reports v2.",
    },
    {
      id: "tk_104",
      shopId: "shop_classicclippers",
      subject: "Payment failed but plan shows past due",
      status: "pending",
      priority: "high",
      createdAt: subDays(now, 2).toISOString(),
      lastMessage: "Retry scheduled; card expired per gateway response.",
    },
  ];
}
