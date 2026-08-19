"use client";

import { subDays, startOfDay } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { useDemoStore } from "@/lib/store";
import { metricsForDay } from "@/lib/selectors";
import { inr } from "@/lib/format";

const BRANCH_ID = "br_kakkanad";

export default function ManagerReportsPage() {
  const data = useDemoStore((s) => s.data);
  const now = new Date();

  const days = Array.from({ length: 7 }, (_, i) => subDays(startOfDay(now), i));

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Daily reports"
        description="Last 7 days at Kakkanad"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Report exported (simulated)", { description: "CSV download would start here." })}
          >
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        }
      />

      {/* Mobile cards */}
      <ul className="grid gap-2 md:hidden">
        {days.map((day) => {
          const m = metricsForDay(data, BRANCH_ID, day);
          return (
            <li key={day.toISOString()} className="rounded-2xl border bg-card p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold">
                  {day.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </p>
                <p className="font-heading font-semibold tabular-nums">{inr(m.revenue)}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {m.appointments} bookings · {m.walkIns} walk-ins · {m.noShows} no-shows ·
                avg {inr(m.avgTicket)}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border md:block">
        <table className="w-full border-collapse bg-card text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th scope="col" className="p-3 font-medium">Date</th>
              <th scope="col" className="p-3 text-right font-medium">Revenue</th>
              <th scope="col" className="p-3 text-right font-medium">Bookings</th>
              <th scope="col" className="p-3 text-right font-medium">Walk-ins</th>
              <th scope="col" className="p-3 text-right font-medium">Completed</th>
              <th scope="col" className="p-3 text-right font-medium">No-shows</th>
              <th scope="col" className="p-3 text-right font-medium">Avg ticket</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const m = metricsForDay(data, BRANCH_ID, day);
              return (
                <tr key={day.toISOString()} className="border-b last:border-0">
                  <td className="p-3 font-medium">
                    {day.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </td>
                  <td className="p-3 text-right font-medium tabular-nums">{inr(m.revenue)}</td>
                  <td className="p-3 text-right tabular-nums">{m.appointments}</td>
                  <td className="p-3 text-right tabular-nums">{m.walkIns}</td>
                  <td className="p-3 text-right tabular-nums">{m.completed}</td>
                  <td className="p-3 text-right tabular-nums">{m.noShows}</td>
                  <td className="p-3 text-right tabular-nums">{inr(m.avgTicket)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
