"use client";

import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { staffById } from "@/lib/selectors";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function LeaveApprovals({ branchId }: { branchId: string | "all" }) {
  const data = useDemoStore((s) => s.data);
  const decideLeave = useDemoStore((s) => s.decideLeave);

  const requests = data.leaveRequests
    .filter((l) => branchId === "all" || l.branchId === branchId)
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return a.requestedAt < b.requestedAt ? 1 : -1;
    });

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={CalendarOff}
        title="No leave requests"
        description="Staff leave requests appear here for approval."
      />
    );
  }

  return (
    <ul className="grid gap-2">
      {requests.map((l) => {
        const staff = staffById(l.staffId, data);
        return (
          <li key={l.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start gap-3">
              {staff && (
                <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="md" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {staff?.name}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {format(new Date(l.startDate), "d MMM")}
                    {l.endDate !== l.startDate &&
                      ` – ${format(new Date(l.endDate), "d MMM")}`}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{l.reason}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Requested {relativeTime(l.requestedAt)}
                </p>
              </div>
              {l.status === "pending" ? (
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      decideLeave(l.id, "rejected");
                      toast(`${staff?.name}'s leave rejected`);
                    }}
                  >
                    <X className="size-4" aria-hidden />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      decideLeave(l.id, "approved");
                      toast.success(`${staff?.name}'s leave approved`, {
                        description: "Their calendar availability has been updated.",
                      });
                    }}
                  >
                    <Check className="size-4" aria-hidden />
                    Approve
                  </Button>
                </div>
              ) : (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
                    l.status === "approved"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {l.status}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
