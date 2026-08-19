"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  ChevronRight,
  Clock,
  NotebookPen,
  Play,
  UserRound,
  UserRoundX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { MetricCard } from "@/components/shared/metric-card";
import { BreakToggle } from "@/components/reception/queue-board";
import { useDemoStore } from "@/lib/store";
import {
  appointmentsForDay,
  commissionForInvoice,
  customerById,
  queueForBranch,
  serviceNames,
} from "@/lib/selectors";
import { inr, timeLabel } from "@/lib/format";

const STAFF_ID = "st_akhil";
const BRANCH_ID = "br_kakkanad";

export default function StaffHome() {
  const data = useDemoStore((s) => s.data);
  const startService = useDemoStore((s) => s.startService);
  const completeService = useDemoStore((s) => s.completeService);
  const markNoShow = useDemoStore((s) => s.markNoShow);
  const addCustomerNote = useDemoStore((s) => s.addCustomerNote);
  const assignStaff = useDemoStore((s) => s.assignStaff);

  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [, forceTick] = useState(0);

  // refresh elapsed timers every 30s
  useEffect(() => {
    const t = setInterval(() => forceTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  const todays = appointmentsForDay(data, BRANCH_ID, now).filter(
    (a) => a.staffId === STAFF_ID
  );
  // "Current" is whoever is actually in the chair — even if their booked slot
  // is on another day (early check-in near closing time).
  const current = data.appointments.find(
    (a) => a.staffId === STAFF_ID && a.status === "in-service"
  );
  const queue = queueForBranch(data, BRANCH_ID, now);
  const myWaiting = queue.waiting.filter(
    (a) => a.staffId === STAFF_ID || a.requestedAnyStaff
  );
  const upNext = [
    ...myWaiting,
    ...todays.filter((a) => a.status === "confirmed"),
  ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const next = upNext[0];

  const completedToday = todays.filter((a) => a.status === "completed");
  const myInvoicesToday = data.invoices.filter(
    (inv) =>
      new Date(inv.createdAt).toDateString() === now.toDateString() &&
      inv.lineItems.some((li) => li.staffId === STAFF_ID)
  );
  const revenueToday = myInvoicesToday.reduce(
    (s, inv) =>
      s +
      inv.lineItems
        .filter((li) => li.staffId === STAFF_ID)
        .reduce((t, li) => t + li.price * li.qty, 0),
    0
  );
  const commissionToday = myInvoicesToday.reduce(
    (s, inv) => s + commissionForInvoice(inv, STAFF_ID),
    0
  );

  const elapsedMin = current?.serviceStartedAt
    ? Math.max(0, Math.round((now.getTime() - new Date(current.serviceStartedAt).getTime()) / 60000))
    : 0;

  const saveNote = () => {
    if (!noteFor || !noteText.trim()) return;
    addCustomerNote(noteFor, noteText.trim());
    toast.success("Note saved to customer profile");
    setNoteFor(null);
    setNoteText("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Hey Akhil 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <BreakToggle staffId={STAFF_ID} />
      </div>

      {/* NOW */}
      <section aria-label="Current customer">
        <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {current && (
            <span className="size-2 animate-pulse rounded-full bg-success" aria-hidden />
          )}
          Now
        </h2>
        {current ? (
          <CurrentCard
            customerName={customerById(data, current.customerId)?.name ?? ""}
            customerTone={customerById(data, current.customerId)?.avatarTone ?? "slate"}
            customerId={current.customerId}
            services={serviceNames(current.serviceIds)}
            startedAt={current.serviceStartedAt}
            elapsedMin={elapsedMin}
            onComplete={() => {
              completeService(current.id);
              toast.success("Service completed", {
                description: "Reception can now check the customer out.",
              });
            }}
            onNote={() => setNoteFor(current.customerId)}
          />
        ) : (
          <div className="rounded-2xl border border-dashed p-6 text-center">
            <p className="text-sm font-medium">Chair is free</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {myWaiting.length > 0
                ? "Pull the next customer from the queue below."
                : "No one is waiting for you right now."}
            </p>
          </div>
        )}
      </section>

      {/* NEXT */}
      {next && next.id !== current?.id && (
        <section aria-label="Next customer">
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Next
          </h2>
          <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <ToneAvatar
              name={customerById(data, next.customerId)?.name ?? ""}
              toneName={customerById(data, next.customerId)?.avatarTone ?? "slate"}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {customerById(data, next.customerId)?.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {serviceNames(next.serviceIds)} ·{" "}
                {next.status === "waiting" ? "in queue" : timeLabel(next.start)}
              </p>
            </div>
            {!current && (next.status === "waiting" || next.status === "checked-in") && (
              <Button
                size="sm"
                onClick={() => {
                  startService(next.id);
                  toast.success("Service started");
                }}
              >
                <Play className="size-4" aria-hidden />
                Start
              </Button>
            )}
            <Link
              href={`/staff/customers/${next.customerId}` as "/"}
              aria-label="View customer profile"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-5" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      {/* WAITING */}
      <section aria-label="Waiting for you">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Waiting · {myWaiting.length}
          </h2>
          <Link href="/staff/queue" className="text-xs font-medium text-primary">
            Full queue
          </Link>
        </div>
        {myWaiting.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            Queue is clear.
          </p>
        ) : (
          <ul className="grid gap-2">
            {myWaiting.slice(0, 4).map((appt, i) => {
              const c = customerById(data, appt.customerId);
              return (
                <li
                  key={appt.id}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{c?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {serviceNames(appt.serviceIds)}
                      {appt.requestedAnyStaff && " · any barber"}
                    </p>
                  </div>
                  {!current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (appt.requestedAnyStaff) assignStaff(appt.id, STAFF_ID);
                        startService(appt.id);
                        toast.success(`Started with ${c?.name}`);
                      }}
                    >
                      <Play className="size-3.5" aria-hidden />
                      Start
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      markNoShow(appt.id);
                      toast("Marked as no-show");
                    }}
                    aria-label={`Mark ${c?.name} as no-show`}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <UserRoundX className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Today stats */}
      <section aria-label="Today's numbers" className="grid grid-cols-3 gap-2">
        <MetricCard compact label="Services" value={completedToday.length} />
        <MetricCard compact label="Revenue" value={revenueToday} format={(n) => inr(n, { compact: true })} />
        <MetricCard compact label="Commission" value={commissionToday} format={(n) => inr(n, { compact: true })} />
      </section>

      {/* Today's schedule */}
      <section aria-label="Today's appointments">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Today&apos;s appointments
          </h2>
          <Link href="/staff/schedule" className="text-xs font-medium text-primary">
            Schedule
          </Link>
        </div>
        <ul className="grid gap-1.5">
          {todays
            .filter((a) => !["cancelled"].includes(a.status))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .map((appt) => {
              const c = customerById(data, appt.customerId);
              const done = appt.status === "completed";
              const noShow = appt.status === "no-show";
              return (
                <li key={appt.id}>
                  <Link
                    href={`/staff/customers/${appt.customerId}` as "/"}
                    className="flex items-center gap-3 rounded-xl border bg-card px-3.5 py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <span className="w-16 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                      {timeLabel(appt.start)}
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate text-sm ${done || noShow ? "text-muted-foreground line-through" : "font-medium"}`}
                    >
                      {c?.name} · {serviceNames(appt.serviceIds)}
                    </span>
                    {done && <Check className="size-4 shrink-0 text-success" aria-hidden />}
                    {noShow && (
                      <span className="shrink-0 text-[10px] font-medium text-destructive">
                        NO SHOW
                      </span>
                    )}
                    {appt.status === "in-service" && (
                      <span className="size-2 shrink-0 animate-pulse rounded-full bg-success" aria-hidden />
                    )}
                  </Link>
                </li>
              );
            })}
          {todays.length === 0 && (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              No appointments today.
            </p>
          )}
        </ul>
      </section>

      {/* Note sheet */}
      <BottomSheet
        open={noteFor !== null}
        onOpenChange={(o) => !o && setNoteFor(null)}
        title="Add customer note"
        description="Visible to you and the team on their profile"
      >
        <div className="grid gap-3 pb-4">
          <Textarea
            placeholder="e.g. Prefers scissor work on top, no machine."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
          />
          <Button onClick={saveNote} disabled={!noteText.trim()}>
            <NotebookPen className="size-4" aria-hidden />
            Save note
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

function CurrentCard({
  customerName,
  customerTone,
  customerId,
  services,
  startedAt,
  elapsedMin,
  onComplete,
  onNote,
}: {
  customerName: string;
  customerTone: string;
  customerId: string;
  services: string;
  startedAt?: string;
  elapsedMin: number;
  onComplete: () => void;
  onNote: () => void;
}) {
  return (
    <div className="rounded-2xl border border-success/30 bg-linear-to-br from-success/10 to-card p-5">
      <div className="flex items-center gap-3">
        <ToneAvatar name={customerName} toneName={customerTone} size="xl" />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold">{customerName}</p>
          <p className="text-sm text-muted-foreground">{services}</p>
          {startedAt && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-success">
              <Clock className="size-3.5" aria-hidden />
              Started {timeLabel(startedAt)} · {elapsedMin} min elapsed
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <Link href={`/staff/customers/${customerId}` as "/"}>
            <UserRound className="size-4" aria-hidden />
            View customer
          </Link>
        </Button>
        <Button variant="outline" onClick={onNote}>
          <NotebookPen className="size-4" aria-hidden />
          Add note
        </Button>
        <Button
          size="lg"
          className="col-span-2 h-12 bg-success text-white hover:bg-success/90"
          onClick={onComplete}
        >
          <Check className="size-5" aria-hidden />
          Complete service
        </Button>
      </div>
    </div>
  );
}
