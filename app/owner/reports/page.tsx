"use client";

import { subDays, startOfDay, startOfMonth } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { useDemoStore } from "@/lib/store";
import { expenseSummary, invoicesForRange, metricsForDay } from "@/lib/selectors";
import { BRANCHES } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";

export default function OwnerReportsPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => subDays(startOfDay(now), i));
  const monthStart = startOfMonth(now);

  const exportToast = () =>
    toast.success("Report exported (simulated)", {
      description: "CSV download would start here.",
    });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        title="Reports"
        description="Operational rollups · export anytime"
        actions={
          <Button variant="outline" size="sm" onClick={exportToast}>
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        }
      />

      {/* Daily */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Daily summary · last 7 days
        </h2>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[560px] border-collapse bg-card text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th scope="col" className="p-3 font-medium">Date</th>
                <th scope="col" className="p-3 text-right font-medium">Revenue</th>
                <th scope="col" className="p-3 text-right font-medium">Bookings</th>
                <th scope="col" className="p-3 text-right font-medium">Walk-ins</th>
                <th scope="col" className="p-3 text-right font-medium">No-shows</th>
                <th scope="col" className="p-3 text-right font-medium">Avg ticket</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const m = metricsForDay(data, branchFilter, day);
                return (
                  <tr key={day.toISOString()} className="border-b last:border-0">
                    <td className="p-3 font-medium">
                      {day.toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="p-3 text-right font-medium tabular-nums">{inr(m.revenue)}</td>
                    <td className="p-3 text-right tabular-nums">{m.appointments}</td>
                    <td className="p-3 text-right tabular-nums">{m.walkIns}</td>
                    <td className="p-3 text-right tabular-nums">{m.noShows}</td>
                    <td className="p-3 text-right tabular-nums">{inr(m.avgTicket)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Branch MTD */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Branch P&L snapshot · month to date
        </h2>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[560px] border-collapse bg-card text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th scope="col" className="p-3 font-medium">Branch</th>
                <th scope="col" className="p-3 text-right font-medium">Revenue</th>
                <th scope="col" className="p-3 text-right font-medium">Expenses</th>
                <th scope="col" className="p-3 text-right font-medium">Est. profit</th>
              </tr>
            </thead>
            <tbody>
              {BRANCHES.filter(
                (b) => branchFilter === "all" || b.id === branchFilter
              ).map((b) => {
                const revenue = invoicesForRange(data, b.id, monthStart, now).reduce(
                  (s, i) => s + i.total,
                  0
                );
                const { total: expenses } = expenseSummary(data, b.id, monthStart, now);
                return (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{b.name}</td>
                    <td className="p-3 text-right tabular-nums">{inr(revenue)}</td>
                    <td className="p-3 text-right tabular-nums">{inr(expenses)}</td>
                    <td className="p-3 text-right font-semibold tabular-nums">
                      {inr(revenue - expenses)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Calculated demo metrics — expense entries are seeded monthly recurring
          + ad-hoc items.
        </p>
      </section>
    </div>
  );
}
