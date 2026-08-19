"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { CalendarOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const STAFF_ID = "st_akhil";
const BRANCH_ID = "br_kakkanad";

export default function StaffLeavePage() {
  const data = useDemoStore((s) => s.data);
  const requestLeave = useDemoStore((s) => s.requestLeave);

  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(format(addDays(new Date(), 2), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 2), "yyyy-MM-dd"));
  const [reason, setReason] = useState("");

  const mine = data.leaveRequests
    .filter((l) => l.staffId === STAFF_ID)
    .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));

  const submit = () => {
    if (!reason.trim() || endDate < startDate) {
      toast.error("Check the dates and add a reason");
      return;
    }
    requestLeave({
      staffId: STAFF_ID,
      branchId: BRANCH_ID,
      startDate,
      endDate,
      reason: reason.trim(),
    });
    toast.success("Leave request sent", {
      description: "Your manager has been notified.",
    });
    setOpen(false);
    setReason("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Leave</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Request leave
        </Button>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="No leave requests"
          description="Request time off and your manager approves it here."
          actionLabel="Request leave"
          onAction={() => setOpen(true)}
        />
      ) : (
        <ul className="grid gap-2">
          {mine.map((l) => (
            <li key={l.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {format(new Date(l.startDate), "d MMM")}
                  {l.endDate !== l.startDate &&
                    ` – ${format(new Date(l.endDate), "d MMM")}`}
                </p>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase",
                    l.status === "pending" && "bg-warning/15 text-warning-foreground dark:text-warning",
                    l.status === "approved" && "bg-success/10 text-success",
                    l.status === "rejected" && "bg-destructive/10 text-destructive"
                  )}
                >
                  {l.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{l.reason}</p>
              {l.decidedBy && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {l.status} by {l.decidedBy}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <BottomSheet open={open} onOpenChange={setOpen} title="Request leave">
        <div className="grid gap-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="leave-start">From</Label>
              <Input
                id="leave-start"
                type="date"
                value={startDate}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) setEndDate(e.target.value);
                }}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="leave-end">To</Label>
              <Input
                id="leave-end"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="leave-reason">Reason</Label>
            <Textarea
              id="leave-reason"
              placeholder="e.g. Family function in Thrissur"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
          <Button size="lg" onClick={submit}>
            Send request
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
