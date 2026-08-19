// Demo V1.1 flexible-shop-mode checks at the store level:
// scenario isolation + deterministic reset, owner-as-barber identity,
// staff-only manual booking, request accept/suggest/decline flows,
// temporary-staff windows (availability, queue, history retention,
// reactivation), managed staff serviceability, config-driven modes.
import { useDemoStore } from "../lib/store";
import { buildSeed } from "../lib/data/seed";
import { SEED_STAFF } from "../lib/data/seed-static";
import {
  isStaffActiveOn,
  queueForBranch,
  staffForBranch,
  staffPerformance,
} from "../lib/selectors";
import {
  availableSlotsAnyStaff,
  availableSlotsForStaff,
} from "../lib/availability";
import { addDays, format, subDays } from "date-fns";

let failures = 0;
const check = (name: string, cond: boolean, detail = "") => {
  if (cond) console.log(`  ✓ ${name}`);
  else { failures++; console.error(`  ✗ ${name} ${detail}`); }
};

// Pin to 7 PM for deterministic day-relative behavior.
const now = new Date();
now.setHours(19, 0, 0, 0);

// ---------------- Deterministic per-scenario seeds ----------------
console.log("— Deterministic scenario seeds —");
for (const scenario of ["solo", "small", "premium"] as const) {
  const a = buildSeed(now, scenario);
  const b = buildSeed(now, scenario);
  check(
    `${scenario} seed is deterministic`,
    JSON.stringify(a.appointments.map((x) => x.id)) ===
      JSON.stringify(b.appointments.map((x) => x.id)) &&
      a.customers.length === b.customers.length,
    `${a.appointments.length} appts`
  );
  check(`${scenario} seed is self-scoped`, a.scenario === scenario);
}

// ---------------- Solo scenario ----------------
console.log("— Solo: Danish Men's Studio —");
let S = useDemoStore.getState();
S.setScenario("solo");
S = useDemoStore.getState();
check("scenario switch reseeds solo world", S.data.businessId === "biz_danishstudio");
check("session tracks scenario", S.session.scenario === "solo");
check("active branch follows scenario", S.session.activeBranchId === S.data.branchId);

const soloRoster = staffForBranch(S.data, S.data.branchId, { activeOn: now });
check("solo roster is exactly one person", soloRoster.length === 1, String(soloRoster.length));
check(
  "owner IS the barber (one identity, no role switch)",
  soloRoster[0]?.title.includes("Owner") && soloRoster[0]?.title.includes("Barber"),
  soloRoster[0]?.title
);
check("no premium staff bleed into solo", !soloRoster.some((s) => s.id.startsWith("st_")));
check(
  "solo operates staff-only + shop-assigned",
  S.data.config.bookingMode === "staff_only" && S.data.config.staffSelection === "shop"
);

// Staff-only manual booking (the <20s "+ Appointment" flow) uses the real engine.
const owner = soloRoster[0]!;
const tomorrow = addDays(now, 1);
const slotDay = tomorrow.getDay() === 1 ? addDays(tomorrow, 1) : tomorrow; // Monday closed
const slots = availableSlotsForStaff(S.data, owner, slotDay, ["svs_haircut"], [], now);
check("owner-barber has real availability", slots.length > 0, String(slots.length));

const manual = S.createBooking({
  branchId: S.data.branchId,
  customerId: S.data.customers[0]!.id,
  staffId: owner.id,
  serviceIds: ["svs_haircut"],
  addonIds: [],
  start: slots[0]!.start.toISOString(),
  paymentPreference: "pay-at-shop",
  source: "phone",
});
S = useDemoStore.getState();
check("manual phone booking lands", manual.status === "confirmed" && manual.source === "phone");
const slotsAfter = availableSlotsForStaff(S.data, owner, slotDay, ["svs_haircut"], [], now);
check(
  "manual booking consumes the slot",
  !slotsAfter.some((s) => s.start.getTime() === slots[0]!.start.getTime())
);

// Walk-in joins the live queue.
const walkIn = S.addWalkIn({
  branchId: S.data.branchId,
  staffId: null,
  serviceIds: ["svs_beard"],
  walkInName: "Flex Test Guest",
});
S = useDemoStore.getState();
const soloQueue = queueForBranch(S.data, S.data.branchId, now);
check("walk-in appears in solo queue", soloQueue.waiting.some((a) => a.id === walkIn.id));

// Serve → complete → checkout: one person does everything.
S.startService(walkIn.id);
useDemoStore.getState().completeService(walkIn.id);
S = useDemoStore.getState();
const inv = S.checkout({
  appointmentId: walkIn.id,
  customerId: S.data.appointments.find((a) => a.id === walkIn.id)!.customerId,
  branchId: S.data.branchId,
  lineItems: [
    { id: "li_flex1", kind: "service", refId: "svs_beard", name: "Beard Trim", price: 100, qty: 1, staffId: owner.id },
  ],
  discount: 0,
  loyaltyPointsUsed: 0,
  tip: 0,
  paymentMethods: [{ method: "upi", amount: 100 }],
});
S = useDemoStore.getState();
check("owner checks out own customer", inv.status === "paid" && inv.total === 100);

// ---------------- Booking requests (online_request mode) ----------------
console.log("— Booking requests —");
S.updateConfig({ bookingMode: "online_request" });
S = useDemoStore.getState();
check("config switch applies immediately", S.data.config.bookingMode === "online_request");

const anySlots = availableSlotsAnyStaff(S.data, S.data.branchId, slotDay, ["svs_haircut"], [], now);
const reqStart = anySlots[0]!.start.toISOString();
const apptCountBefore = S.data.appointments.length;

const req1 = S.requestBooking({
  branchId: S.data.branchId,
  customerName: "Rafi K",
  customerPhone: "+91 98470 11111",
  serviceIds: ["svs_haircut"],
  preferredStart: reqStart,
});
S = useDemoStore.getState();
check("request recorded as pending", S.data.bookingRequests.find((r) => r.id === req1.id)?.status === "requested");
check(
  "pending request consumes NO capacity",
  S.data.appointments.length === apptCountBefore &&
    availableSlotsAnyStaff(S.data, S.data.branchId, slotDay, ["svs_haircut"], [], now)
      .some((s) => s.start.toISOString() === reqStart)
);

S.acceptBookingRequest(req1.id);
S = useDemoStore.getState();
const req1After = S.data.bookingRequests.find((r) => r.id === req1.id)!;
check("accept confirms request", req1After.status === "confirmed" && !!req1After.appointmentId);
const req1Appt = S.data.appointments.find((a) => a.id === req1After.appointmentId);
check("accept creates a real appointment", req1Appt?.status === "confirmed" && req1Appt.start === reqStart);
check("accept creates the customer", S.data.customers.some((c) => c.id === req1Appt?.customerId));

// Suggest-then-accept path.
const req2 = useDemoStore.getState().requestBooking({
  branchId: S.data.branchId,
  customerName: "Shanavas P",
  serviceIds: ["svs_cutbeard"],
  preferredStart: reqStart,
});
const suggested = anySlots[2] ?? anySlots[1];
useDemoStore.getState().suggestBookingTime(req2.id, suggested!.start.toISOString());
S = useDemoStore.getState();
check("suggest marks request", S.data.bookingRequests.find((r) => r.id === req2.id)?.status === "suggested");
S.acceptSuggestedTime(req2.id);
S = useDemoStore.getState();
const req2After = S.data.bookingRequests.find((r) => r.id === req2.id)!;
const req2Appt = S.data.appointments.find((a) => a.id === req2After.appointmentId);
check(
  "customer accepting suggestion books the suggested time",
  req2After.status === "confirmed" && req2Appt?.start === suggested!.start.toISOString()
);

// Decline path leaves no appointment behind.
const req3 = useDemoStore.getState().requestBooking({
  branchId: S.data.branchId,
  customerName: "Anoop V",
  serviceIds: ["svs_haircut"],
  preferredStart: reqStart,
});
const apptsBeforeDecline = useDemoStore.getState().data.appointments.length;
useDemoStore.getState().declineBookingRequest(req3.id);
S = useDemoStore.getState();
check(
  "declined request never becomes an appointment",
  S.data.bookingRequests.find((r) => r.id === req3.id)?.status === "declined" &&
    S.data.appointments.length === apptsBeforeDecline
);

// ---------------- Small scenario: temporary staff ----------------
console.log("— Small: Brothers Hair Point, temporary staff —");
S.setScenario("small");
S = useDemoStore.getState();
check("small world active", S.data.businessId === "biz_brothers");

const nabeel = staffForBranch(S.data, S.data.branchId, { includeInactive: true }).find(
  (s) => s.id === "stb_nabeel"
)!;
check("Nabeel is temporary + managed by shop",
  nabeel.employmentType === "temporary" && nabeel.accessType === "managed_by_shop");
check("Nabeel's contract window is live on the roster",
  !!nabeel.activeFrom && !!nabeel.activeUntil && isStaffActiveOn(nabeel, now));

const smallRosterToday = staffForBranch(S.data, S.data.branchId, { activeOn: now });
check("active roster includes Nabeel inside window",
  smallRosterToday.some((s) => s.id === "stb_nabeel"));

const afterWindow = addDays(new Date(nabeel.activeUntil!), 2);
check("roster excludes Nabeel after contract ends",
  !staffForBranch(S.data, S.data.branchId, { activeOn: afterWindow }).some((s) => s.id === "stb_nabeel"));
check("availability engine gives Nabeel slots inside window",
  availableSlotsForStaff(S.data, nabeel, slotDay, ["svb_haircut"], [], now).length > 0);
check("availability engine refuses Nabeel outside window",
  availableSlotsForStaff(S.data, nabeel, afterWindow, ["svb_haircut"], [], now).length === 0);

// Managed staff (no app login) is fully serviceable by the owner.
const nabeelBooking = S.createBooking({
  branchId: S.data.branchId,
  customerId: S.data.customers[0]!.id,
  staffId: "stb_nabeel",
  serviceIds: ["svb_haircut"],
  addonIds: [],
  start: availableSlotsForStaff(S.data, nabeel, slotDay, ["svb_haircut"], [], now)[0]!.start.toISOString(),
  paymentPreference: "pay-at-shop",
  source: "phone",
});
check("owner can book customers onto managed staff", nabeelBooking.staffId === "stb_nabeel");

// Simulated app invite for managed staff.
useDemoStore.getState().inviteStaffToApp("stb_nabeel");
S = useDemoStore.getState();
check("invite simulation marks pending",
  staffForBranch(S.data, S.data.branchId, { includeInactive: true })
    .find((s) => s.id === "stb_nabeel")?.inviteStatus === "pending");

// History retention: expire the contract, history stays, roster drops him.
useDemoStore.getState().reactivateStaff("stb_nabeel", format(subDays(now, 1), "yyyy-MM-dd"));
// (reactivateStaff also re-stamps activeFrom=today, making the window empty → expired)
S = useDemoStore.getState();
const nabeelExpired = staffForBranch(S.data, S.data.branchId, { includeInactive: true })
  .find((s) => s.id === "stb_nabeel")!;
const nabeelHistory = S.data.appointments.filter(
  (a) => a.staffId === "stb_nabeel" && a.status === "completed"
);
const perf = staffPerformance(S.data, S.data.branchId, subDays(now, 30), now);
check("expired contract keeps appointment history", nabeelHistory.length > 0, String(nabeelHistory.length));
check("expired staff still appears in performance reports",
  perf.some((p) => p.staff.id === "stb_nabeel"));
check("expired staff drops out of active roster",
  !staffForBranch(S.data, S.data.branchId, { activeOn: addDays(now, 1) }).some((s) => s.id === "stb_nabeel"),
  `${nabeelExpired.activeFrom} → ${nabeelExpired.activeUntil}`);

// Reactivation brings him back without losing anything.
useDemoStore.getState().reactivateStaff("stb_nabeel", format(addDays(now, 14), "yyyy-MM-dd"));
S = useDemoStore.getState();
check("reactivated staff rejoins the roster",
  staffForBranch(S.data, S.data.branchId, { activeOn: addDays(now, 1) }).some((s) => s.id === "stb_nabeel"));
check("history survives reactivation",
  S.data.appointments.filter((a) => a.staffId === "stb_nabeel" && a.status === "completed").length ===
    nabeelHistory.length);

// Runtime-added temporary staff (AddStaffSheet path).
const seasonal = {
  ...nabeel,
  id: "st_flex_temp",
  userId: "user_st_flex_temp",
  name: "Flex Seasonal",
  inviteStatus: undefined,
  activeFrom: format(now, "yyyy-MM-dd"),
  activeUntil: format(addDays(now, 25), "yyyy-MM-dd"),
};
useDemoStore.getState().addStaff(seasonal);
S = useDemoStore.getState();
check("runtime-added temp staff joins the roster",
  staffForBranch(S.data, S.data.branchId, { activeOn: now }).some((s) => s.id === "st_flex_temp"));
check("runtime staff never leaks into seed", !SEED_STAFF.some((s) => s.id === "st_flex_temp"));

// ---------------- Reset + isolation ----------------
console.log("— Reset & isolation —");
useDemoStore.getState().resetDemo();
S = useDemoStore.getState();
check("reset stays in the current scenario", S.data.scenario === "small" && S.session.scenario === "small");
check("reset clears runtime staff", S.data.extraStaff.length === 0);
check("reset restores Nabeel's live window",
  isStaffActiveOn(
    staffForBranch(S.data, S.data.branchId, { includeInactive: true }).find((s) => s.id === "stb_nabeel")!,
    new Date()
  ));

useDemoStore.getState().setScenario("premium");
S = useDemoStore.getState();
check("premium world intact after scenario churn",
  S.data.businessId === "biz_royalcuts" &&
    staffForBranch(S.data, "br_kakkanad", { activeOn: now }).every((s) => s.id.startsWith("st_")));
check("premium config restored",
  S.data.config.bookingMode === "online_instant" && S.data.config.staffSelection === "customer");

if (failures) {
  console.error(`\n${failures} FAILURES`);
  process.exit(1);
}
console.log("\nFlexible shop modes verified at the store level.");
