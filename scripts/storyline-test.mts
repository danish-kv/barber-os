// End-to-end storyline at the store level:
// book (tomorrow slot, after-hours case) → check in → queue → start → complete
// → POS checkout → loyalty/membership/inventory/owner-revenue effects.
import { useDemoStore } from "../lib/store";
import {
  queueForBranch,
  metricsForDay,
  customerStats,
} from "../lib/selectors";
import { availableSlotsForStaff } from "../lib/availability";
import { STAFF, MEMBERSHIP_PLANS } from "../lib/data/seed-static";
import { addDays } from "date-fns";

let failures = 0;
const check = (name: string, cond: boolean, detail = "") => {
  if (cond) console.log(`  ✓ ${name}`);
  else { failures++; console.error(`  ✗ ${name} ${detail}`); }
};

const store = useDemoStore.getState();
store.resetDemo();
let S = useDemoStore.getState();
const now = new Date();

// ---- Flow A: customer books Haircut+Beard with Akhil (today or tomorrow) ----
const akhil = STAFF.find((s) => s.id === "st_akhil")!;
let slot = availableSlotsForStaff(S.data, akhil, now, ["sv_haircutbeard"], [], now)[0]
  ?? availableSlotsForStaff(S.data, akhil, addDays(now, 1), ["sv_haircutbeard"], [], now)[0];
check("bookable Akhil slot exists", !!slot);

const appt = S.createBooking({
  branchId: "br_kakkanad",
  customerId: "cu_danish",
  staffId: "st_akhil",
  serviceIds: ["sv_haircutbeard"],
  addonIds: [],
  start: slot.start.toISOString(),
  paymentPreference: "advance",
});
S = useDemoStore.getState();
check("booking created & confirmed", appt.status === "confirmed" && appt.advancePaid === true);
check("reception notified", S.data.notifications.some((n) => n.role === "receptionist" && n.title.includes("online booking")));

// ---- Flow B: reception checks in (slot may be tomorrow — after-hours case) ----
S.checkIn(appt.id);
S = useDemoStore.getState();
const q1 = queueForBranch(S.data, "br_kakkanad", now);
check("Danish appears in today's live queue after check-in", q1.waiting.some((a) => a.id === appt.id));

// ---- Flow C: barber starts + completes ----
const bladesBefore = S.data.inventory.find((i) => i.id === "it_kakkanad_disposableblades")!.quantity;
S.startService(appt.id);
S = useDemoStore.getState();
const q2 = queueForBranch(S.data, "br_kakkanad", now);
check("in-service appears under NOW", q2.serving.some((a) => a.id === appt.id));
S.addCustomerNote("cu_danish", "Storyline test note");
S.completeService(appt.id);
S = useDemoStore.getState();
check("service completed", S.data.appointments.find((a) => a.id === appt.id)!.status === "completed");
const bladesAfter = S.data.inventory.find((i) => i.id === "it_kakkanad_disposableblades")!.quantity;
check("consumables depleted on completion", bladesAfter < bladesBefore, `${bladesBefore} -> ${bladesAfter}`);
check("note saved to customer", S.data.customers.find((c) => c.id === "cu_danish")!.notes.includes("Storyline test note"));

// ---- Flow D: POS checkout with membership + product + loyalty ----
const revBefore = metricsForDay(S.data, "all", now).revenue;
const ptsBefore = S.data.loyaltyAccounts.find((l) => l.customerId === "cu_danish")!.points;
const memBefore = S.data.memberships.find((m) => m.customerId === "cu_danish")!;
const beardOil = S.data.inventory.find((i) => i.id === "it_kakkanad_beardoil")!;
const oilBefore = beardOil.quantity;

const invoice = S.checkout({
  appointmentId: appt.id,
  customerId: "cu_danish",
  branchId: "br_kakkanad",
  lineItems: [
    { id: "li1", kind: "service", refId: "sv_haircutbeard", name: "Haircut + Beard", price: 350, qty: 1, staffId: "st_akhil" },
    { id: "li2", kind: "product", refId: beardOil.id, name: "Beard Oil", price: 499, qty: 1, staffId: "st_akhil" },
  ],
  discount: 0,
  loyaltyPointsUsed: 100,
  tip: 50,
  paymentMethods: [{ method: "upi", amount: 0 }],
});
S = useDemoStore.getState();

// Expected: 350+499=849 −100 advance −100 loyalty −10% product membership disc(≈50) +50 tip
const plan = MEMBERSHIP_PLANS.find((p) => p.id === memBefore.planId)!;
const expectedMemDisc = Math.round(499 * plan.discountPercent / 100);
check("membership product discount applied", invoice.membershipDiscount === expectedMemDisc, `${invoice.membershipDiscount} vs ${expectedMemDisc}`);
check("advance deducted in payment mix", invoice.paymentMethods.some((p) => p.method === "advance" && p.amount === 100));
check("loyalty redeemed ₹100", invoice.loyaltyRedeemed === 100);
const expectedTotal = 849 - 100 /*loyalty*/ - expectedMemDisc + 50 /*tip*/ - 100 /*advance*/;
check("invoice total correct", invoice.total === expectedTotal, `${invoice.total} vs ${expectedTotal}`);
check("product stock decremented", S.data.inventory.find((i) => i.id === beardOil.id)!.quantity === oilBefore - 1);

const ptsAfter = S.data.loyaltyAccounts.find((l) => l.customerId === "cu_danish")!.points;
const earned = Math.floor(invoice.total / 10);
check("loyalty: -100 redeemed, +earned", ptsAfter === ptsBefore - 100 + earned, `${ptsBefore} -> ${ptsAfter} (earned ${earned})`);

// ---- Flow E: owner impact ----
const revAfter = metricsForDay(S.data, "all", now).revenue;
check("owner today revenue increased by invoice total", revAfter === revBefore + invoice.total, `${revBefore} -> ${revAfter}`);
const stats = customerStats(S.data, "cu_danish")!;
check("customer lifetime spend includes invoice", stats.lifetimeSpend >= invoice.total);

// ---- Flow G: leave ----
S.requestLeave({ staffId: "st_nikhil", branchId: "br_kakkanad", startDate: "2026-08-25", endDate: "2026-08-25", reason: "test" });
S = useDemoStore.getState();
const lr = S.data.leaveRequests.find((l) => l.reason === "test")!;
S.decideLeave(lr.id, "approved");
S = useDemoStore.getState();
check("leave approved updates shifts", S.data.shifts.some((sh) => sh.staffId === "st_nikhil" && sh.date === "2026-08-25" && sh.status === "leave"));
const slotsOnLeave = availableSlotsForStaff(S.data, STAFF.find(s => s.id === "st_nikhil")!, new Date("2026-08-25T00:00:00"), ["sv_haircut"], [], now);
check("no availability on approved leave day", slotsOnLeave.length === 0);

// ---- Flow H: purchase order ----
const blades2 = S.data.inventory.find((i) => i.id === "it_kakkanad_disposableblades")!;
const po = S.createPurchaseOrder({ branchId: "br_kakkanad", vendorId: "vd_cochinmart", items: [{ itemId: blades2.id, qty: 20, unitCost: 90 }] });
S.receivePurchaseOrder(po.id);
S = useDemoStore.getState();
check("PO receipt restocks inventory", S.data.inventory.find((i) => i.id === blades2.id)!.quantity === blades2.quantity + 20);

if (failures) { console.error(`\n${failures} FAILURES`); process.exit(1); }
console.log("\nStoryline verified end-to-end at the store level.");
