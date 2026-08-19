"use client";

import { startOfMonth } from "date-fns";
import { useDemoStore } from "@/lib/store";
import { commissionForInvoice } from "@/lib/selectors";
import { STAFF } from "@/lib/data/seed-static";
import { inr, percent } from "@/lib/format";

const STAFF_ID = "st_akhil";

const CATEGORY_LABEL: Record<string, string> = {
  hair: "Haircuts & styling",
  beard: "Beard services",
  color: "Hair colour",
  spa: "Facials & massage",
  kids: "Kids",
  product: "Product sales",
  default: "Other services",
};

export default function StaffCommissionsPage() {
  const data = useDemoStore((s) => s.data);
  const staff = STAFF.find((s) => s.id === STAFF_ID)!;
  const monthStart = startOfMonth(new Date());

  let serviceRevenue = 0;
  let productRevenue = 0;
  let commission = 0;
  for (const inv of data.invoices) {
    if (new Date(inv.createdAt).getTime() < monthStart.getTime()) continue;
    const mine = inv.lineItems.filter((li) => li.staffId === STAFF_ID);
    if (mine.length === 0) continue;
    serviceRevenue += mine
      .filter((li) => li.kind !== "product")
      .reduce((s, li) => s + li.price * li.qty, 0);
    productRevenue += mine
      .filter((li) => li.kind === "product")
      .reduce((s, li) => s + li.price * li.qty, 0);
    commission += commissionForInvoice(inv, STAFF_ID);
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Commissions</h1>

      <section className="rounded-2xl border bg-sidebar p-5 text-sidebar-foreground">
        <p className="text-xs font-semibold tracking-widest text-sidebar-primary uppercase">
          This month
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] text-sidebar-foreground/70">Service revenue</p>
            <p className="font-heading text-lg font-semibold text-sidebar-accent-foreground tabular-nums">
              {inr(serviceRevenue, { compact: true })}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-sidebar-foreground/70">Product revenue</p>
            <p className="font-heading text-lg font-semibold text-sidebar-accent-foreground tabular-nums">
              {inr(productRevenue, { compact: true })}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-sidebar-foreground/70">Commission</p>
            <p className="font-heading text-lg font-semibold text-sidebar-primary tabular-nums">
              {inr(commission, { compact: true })}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Your rates
        </h2>
        <ul className="overflow-hidden rounded-2xl border bg-card">
          {staff.commissionRules.map((rule, i) => (
            <li
              key={rule.serviceCategory}
              className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t" : ""}`}
            >
              <span className="text-sm font-medium">
                {CATEGORY_LABEL[rule.serviceCategory] ?? rule.serviceCategory}
              </span>
              <span className="font-heading text-sm font-semibold tabular-nums">
                {percent(rule.rate)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Rates are set by the owner per service category. Commission accrues
          when the customer pays at the POS.
        </p>
      </section>
    </div>
  );
}
