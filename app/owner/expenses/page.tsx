"use client";

import { useState } from "react";
import { startOfMonth, format } from "date-fns";
import { toast } from "sonner";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { BarList } from "@/components/charts/bar-list";
import { useDemoStore } from "@/lib/store";
import { branchById, expenseSummary, invoicesForRange } from "@/lib/selectors";
import { inr } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  rent: "Rent",
  electricity: "Electricity",
  salaries: "Salaries",
  consumables: "Consumables",
  marketing: "Marketing",
  maintenance: "Maintenance",
  software: "Software",
  misc: "Miscellaneous",
};

export default function OwnerExpensesPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const [showAll, setShowAll] = useState(false);

  const now = new Date();
  const monthStart = startOfMonth(now);

  const { byCategory, total } = expenseSummary(data, branchFilter, monthStart, now);
  const revenue = invoicesForRange(data, branchFilter, monthStart, now).reduce(
    (s, i) => s + i.total,
    0
  );
  const profit = revenue - total;

  const recent = data.expenses
    .filter((e) => branchFilter === "all" || e.branchId === branchFilter)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, showAll ? 60 : 12);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Expenses & profit"
        description={`Month to date · ${format(monthStart, "MMMM yyyy")}`}
        actions={
          <Button
            size="sm"
            onClick={() =>
              toast("Add expense", {
                description: "Expense entry form ships with the finance module — demo data is seeded.",
              })
            }
          >
            <Plus className="size-4" aria-hidden />
            Add expense
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <MetricCard compact label="Revenue (MTD)" value={revenue} format={(n) => inr(n, { compact: true })} />
        <MetricCard compact label="Expenses (MTD)" value={total} format={(n) => inr(n, { compact: true })} />
        <MetricCard
          compact
          label="Est. operating profit"
          value={profit}
          format={(n) => inr(n, { compact: true })}
          hint="calculated · demo"
        />
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">By category · month to date</h2>
        <BarList
          className="mt-4"
          color="var(--chart-5)"
          items={[...byCategory.entries()]
            .map(([cat, v]) => ({ label: CATEGORY_LABEL[cat] ?? cat, value: v }))
            .sort((a, b) => b.value - a.value)}
          formatValue={(v) => inr(v, { compact: true })}
        />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Recent entries
          </h2>
          <button
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show fewer" : "Show all"}
          </button>
        </div>
        <ul className="grid gap-1.5">
          {recent.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Receipt className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{e.label}</p>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABEL[e.category]}
                  {branchFilter === "all" && ` · ${branchById(e.branchId)?.name}`}
                  {" · "}
                  {format(new Date(e.date), "d MMM")}
                  {e.recurring && " · recurring"}
                </p>
              </div>
              <span className="font-medium tabular-nums">{inr(e.amount)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
