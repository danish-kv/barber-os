// Headless smoke test: exercises seed + availability + queue + checkout math.
import { buildSeed } from "../lib/data/seed";
import { STAFF } from "../lib/data/seed-static";
import {
  availableSlotsForStaff,
  availableSlotsAnyStaff,
  findGaps,
} from "../lib/availability";
import {
  queueForBranch,
  metricsForDay,
  businessInsights,
  customerSegments,
  staffPerformance,
  lowStockItems,
} from "../lib/selectors";
import { subDays } from "date-fns";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures++;
    console.error(`  ✗ ${name} ${detail}`);
  }
}

// Pin "now" to 7 PM so day-relative assertions (e.g. today's revenue) are
// deterministic no matter what time of day the test runs.
const now = new Date();
now.setHours(19, 0, 0, 0);
const data = buildSeed(now);

console.log("— Seed shape —");
check("customers seeded", data.customers.length > 150, String(data.customers.length));
check("appointments seeded", data.appointments.length > 400, String(data.appointments.length));
check("invoices seeded", data.invoices.length > 300, String(data.invoices.length));
check("danish exists", data.customers.some((c) => c.id === "cu_danish"));
check("danish history >= 10 visits",
  data.appointments.filter((a) => a.customerId === "cu_danish" && a.status === "completed").length >= 10);

console.log("— Availability engine —");
const akhil = STAFF.find((s) => s.id === "st_akhil")!;
const combo = ["sv_haircutbeard"];
let slotFound = false;
for (let d = 0; d < 3 && !slotFound; d++) {
  const day = new Date(now.getTime() + d * 864e5);
  const slots = availableSlotsForStaff(data, akhil, day, combo, [], now);
  if (slots.length > 0) slotFound = true;
}
check("Akhil has a bookable Haircut+Beard slot within 3 days", slotFound);

const colourSlots = availableSlotsAnyStaff(data, "br_edappally", new Date(now.getTime() + 864e5), ["sv_haircolour"], [], now);
let overlapBad = 0;
for (const slot of colourSlots) {
  const end = slot.start.getTime() + 90 * 60000;
  const clash = data.appointments.some((a) =>
    a.staffId === slot.staffId &&
    !["cancelled", "no-show"].includes(a.status) &&
    slot.start.getTime() < new Date(a.end).getTime() &&
    new Date(a.start).getTime() < end
  );
  if (clash) overlapBad++;
}
check("90-min colour slots never overlap existing bookings", overlapBad === 0, `${overlapBad} of ${colourSlots.length}`);

console.log("— Queue —");
const q = queueForBranch(data, "br_kakkanad", now);
check("staffState covers all Kakkanad staff", q.staffState.length === 4);
const withinHours = now.getHours() >= 10 && now.getHours() < 20;
if (withinHours) {
  check("waiting queue has seeded walk-ins", q.waiting.length >= 1, String(q.waiting.length));
  check("wait estimates assigned", q.waiting.every((w) => typeof w.estimatedWaitMin === "number"));
}

console.log("— Metrics & insights —");
const m = metricsForDay(data, "all", now);
check("today revenue > 0", m.revenue > 0, String(m.revenue));
check("today appointments > 10", m.appointments > 10, String(m.appointments));
const insights = businessInsights(data, "all", now);
check("insights generated", insights.length >= 3, String(insights.length));
const segs = customerSegments(data, "all");
check("inactive-60 segment nonempty", segs.inactive60.length > 0, String(segs.inactive60.length));
const perf = staffPerformance(data, "all", subDays(now, 30), now);
check("staff performance rows", perf.length === STAFF.length);
check("top staff has revenue", perf[0].revenue > 0);
check("commissions computed", perf[0].commission > 0);
const low = lowStockItems(data, "br_kakkanad");
check("storyline low-stock items present", low.some((i) => i.name === "Disposable Blades"));

console.log("— Gap finder —");
const gaps = findGaps(data, "st_akhil", now);
check("gap finder runs", Array.isArray(gaps), String(gaps.length));

if (failures > 0) {
  console.error(`\n${failures} FAILURES`);
  process.exit(1);
}
console.log("\nAll data-layer checks passed.");
