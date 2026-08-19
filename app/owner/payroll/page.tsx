"use client";

import { startOfMonth, format } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { commissionForInvoice } from "@/lib/selectors";
import { STAFF } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";

// Simulated base salaries by role for demo payroll math.
const BASE_SALARY: Record<string, number> = {
  "senior-barber": 22000,
  stylist: 20000,
  barber: 16000,
  trainee: 10000,
};

export default function OwnerPayrollPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const monthStart = startOfMonth(new Date());

  const staffList = STAFF.filter(
    (s) => branchFilter === "all" || s.branchId === branchFilter
  );

  const rows = staffList.map((staff) => {
    let commission = 0;
    for (const inv of data.invoices) {
      if (new Date(inv.createdAt).getTime() < monthStart.getTime()) continue;
      if (!inv.lineItems.some((li) => li.staffId === staff.id)) continue;
      commission += commissionForInvoice(inv, staff.id);
    }
    const base = BASE_SALARY[staff.role] ?? 15000;
    return { staff, base, commission, total: base + commission };
  });

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Payroll"
        description={`${format(monthStart, "MMMM yyyy")} · base + live commission accrual`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success("Payroll exported (simulated)", {
                description: "CSV with base, commission and totals.",
              })
            }
          >
            <Download className="size-4" aria-hidden />
            Export
          </Button>
        }
      />

      {/* Mobile cards */}
      <ul className="grid gap-2 lg:hidden">
        {rows.map((r) => (
          <li key={r.staff.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <ToneAvatar name={r.staff.name} toneName={r.staff.avatarTone} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{r.staff.name}</p>
              <p className="text-xs text-muted-foreground">
                Base {inr(r.base, { compact: true })} + comm{" "}
                {inr(r.commission, { compact: true })}
              </p>
            </div>
            <span className="font-heading font-semibold tabular-nums">{inr(r.total)}</span>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border lg:block">
        <table className="w-full border-collapse bg-card text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th scope="col" className="p-3 font-medium">Staff</th>
              <th scope="col" className="p-3 font-medium">Role</th>
              <th scope="col" className="p-3 text-right font-medium">Base salary</th>
              <th scope="col" className="p-3 text-right font-medium">Commission (MTD)</th>
              <th scope="col" className="p-3 text-right font-medium">Payable</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.staff.id} className="border-b last:border-0">
                <td className="p-3">
                  <span className="flex items-center gap-2.5 font-medium">
                    <ToneAvatar name={r.staff.name} toneName={r.staff.avatarTone} size="xs" />
                    {r.staff.name}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground capitalize">
                  {r.staff.role.replace("-", " ")}
                </td>
                <td className="p-3 text-right tabular-nums">{inr(r.base)}</td>
                <td className="p-3 text-right tabular-nums">{inr(r.commission)}</td>
                <td className="p-3 text-right font-semibold tabular-nums">{inr(r.total)}</td>
              </tr>
            ))}
            <tr className="bg-muted/30">
              <td colSpan={4} className="p-3 font-semibold">
                Total payroll (MTD accrual)
              </td>
              <td className="p-3 text-right font-heading font-semibold tabular-nums">
                {inr(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Base salaries are demo values. Commission accrues live from POS checkouts
        using each staff member&apos;s per-category rates.
      </p>
    </div>
  );
}
