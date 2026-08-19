"use client";

// Weekly staff schedule grid. Working / break / leave / off states,
// with tap-to-cycle editing in demo state (manager/owner only).

import { useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { staffForBranch } from "@/lib/selectors";
import type { ShiftStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<ShiftStatus, { label: string; className: string }> = {
  working: { label: "Working", className: "bg-success/10 text-success border-success/30" },
  break: { label: "Break", className: "bg-warning/15 text-warning-foreground dark:text-warning border-warning/40" },
  leave: { label: "Leave", className: "bg-destructive/10 text-destructive border-destructive/30" },
  off: { label: "Off", className: "bg-muted text-muted-foreground border-transparent" },
  overtime: { label: "OT", className: "bg-info/10 text-info border-info/30" },
};

export function ShiftSchedule({
  branchId,
  editable = false,
}: {
  branchId: string;
  editable?: boolean;
}) {
  const data = useDemoStore((s) => s.data);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const branchStaff = staffForBranch(data, branchId, { includeInactive: true });

  const shiftFor = (staffId: string, dateKey: string) =>
    data.shifts.find((s) => s.staffId === staffId && s.date === dateKey);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
              This week
            </Button>
          )}
        </div>
        <p className="text-sm font-medium">
          {format(weekStart, "d MMM")} – {format(days[6], "d MMM")}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th scope="col" className="p-3 text-left font-medium">Staff</th>
              {days.map((day) => (
                <th key={day.toISOString()} scope="col" className="p-2 text-center font-medium">
                  <span className="block text-[10px] text-muted-foreground uppercase">
                    {format(day, "EEE")}
                  </span>
                  <span className="font-heading">{format(day, "d")}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branchStaff.map((staff) => (
              <tr key={staff.id} className="border-b last:border-0">
                <th scope="row" className="p-3 text-left font-normal">
                  <span className="flex items-center gap-2">
                    <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="xs" />
                    <span className="font-medium">{staff.name}</span>
                  </span>
                </th>
                {days.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const shift = shiftFor(staff.id, dateKey);
                  const status: ShiftStatus = shift?.status ?? "off";
                  const style = STATUS_STYLE[status];
                  return (
                    <td key={dateKey} className="p-1.5 text-center">
                      <button
                        disabled={!editable}
                        onClick={() => {
                          if (!editable) return;
                          toast("Shift editing", {
                            description:
                              "Full shift editor ships with the roster module — leave approvals already update this grid.",
                          });
                        }}
                        className={cn(
                          "w-full rounded-lg border px-1 py-1.5 text-[10px] font-medium",
                          style.className,
                          editable && "cursor-pointer hover:opacity-80"
                        )}
                      >
                        {style.label}
                        {status === "working" && shift?.start && (
                          <span className="block text-[9px] font-normal opacity-80">
                            {shift.start}–{shift.end}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {Object.entries(STATUS_STYLE).map(([key, v]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cn("inline-block size-2.5 rounded-sm border", v.className)} aria-hidden />
            {v.label}
          </span>
        ))}
      </div>
    </div>
  );
}
