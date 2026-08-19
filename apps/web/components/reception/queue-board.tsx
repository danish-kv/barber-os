"use client";

// The live queue board — shared by reception, owner and manager views.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  Clock,
  ListPlus,
  MoreHorizontal,
  Play,
  UserRoundX,
  UserRound,
  Coffee,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { customerById, queueForBranch, serviceNames } from "@/lib/selectors";
import { STAFF } from "@/lib/data/seed-static";
import { useNow } from "@/hooks/use-now";
import { WalkInSheet } from "./walk-in-sheet";
import { cn } from "@/lib/utils";

export function QueueBoard({
  branchId,
  readOnly = false,
  posHrefBase = "/reception/pos",
}: {
  branchId: string;
  readOnly?: boolean;
  posHrefBase?: string;
}) {
  const data = useDemoStore((s) => s.data);
  const assignStaff = useDemoStore((s) => s.assignStaff);
  const startService = useDemoStore((s) => s.startService);
  const completeService = useDemoStore((s) => s.completeService);
  const markNoShow = useDemoStore((s) => s.markNoShow);
  const cancelAppointment = useDemoStore((s) => s.cancelAppointment);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const router = useRouter();
  const now = useNow(15000);

  const queue = queueForBranch(data, branchId, now);

  const freeStaff = queue.staffState.filter((s) => s.state === "free");

  return (
    <div className="flex flex-col gap-6">
      {/* Staff strip */}
      <section aria-label="Barber availability">
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar lg:mx-0 lg:flex-wrap lg:px-0">
          {queue.staffState.map(({ staff, state, current, remainingMin }) => (
            <div
              key={staff.id}
              className={cn(
                "flex min-w-40 shrink-0 items-center gap-2.5 rounded-xl border bg-card p-3",
                state === "serving" && "border-success/40",
                state === "free" && "border-info/40"
              )}
            >
              <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{staff.name}</p>
                <p
                  className={cn(
                    "text-xs font-medium",
                    state === "serving" && "text-success",
                    state === "free" && "text-info",
                    state === "break" && "text-warning-foreground dark:text-warning",
                    (state === "off" || state === "leave") && "text-muted-foreground"
                  )}
                >
                  {state === "serving"
                    ? `Serving · ${remainingMin} min left`
                    : state === "free"
                      ? "Available"
                      : state === "break"
                        ? "On break"
                        : state === "leave"
                          ? "On leave"
                          : "Off today"}
                </p>
                {current && (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {customerById(data, current.customerId)?.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NOW SERVING */}
      <section aria-label="Now serving">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <span className="size-2 animate-pulse rounded-full bg-success" aria-hidden />
            Now serving ({queue.serving.length})
          </h2>
          {!readOnly && (
            <Button size="sm" onClick={() => setWalkInOpen(true)}>
              <ListPlus className="size-4" aria-hidden />
              Add walk-in
            </Button>
          )}
        </div>
        {queue.serving.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            No one is in the chair right now.
          </p>
        ) : (
          <div className="grid gap-2 lg:grid-cols-2">
            {queue.serving.map((appt) => {
              const customer = customerById(data, appt.customerId);
              const staff = STAFF.find((s) => s.id === appt.staffId);
              const remaining = Math.max(
                1,
                Math.round((new Date(appt.end).getTime() - now.getTime()) / 60000)
              );
              return (
                <div
                  key={appt.id}
                  className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-4"
                >
                  {customer && (
                    <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="md" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{customer?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {serviceNames(appt.serviceIds)}
                      {staff && ` · with ${staff.name}`}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-success">
                      <Clock className="size-3" aria-hidden />~{remaining} min remaining
                    </p>
                  </div>
                  {!readOnly && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-success/40 text-success hover:bg-success/10 hover:text-success"
                      onClick={() => {
                        completeService(appt.id);
                        toast.success("Service completed", {
                          description: "Ready for checkout at POS.",
                          action: {
                            label: "Checkout",
                            onClick: () => {
                              router.push(
                                `${posHrefBase}?appointment=${appt.id}` as "/"
                              );
                            },
                          },
                        });
                      }}
                    >
                      <Check className="size-4" aria-hidden />
                      Complete
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* WAITING */}
      <section aria-label="Waiting queue">
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Waiting ({queue.waiting.length})
        </h2>
        {queue.waiting.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="Queue is clear"
            description="Walk-ins and checked-in appointments will appear here."
            actionLabel={readOnly ? undefined : "Add walk-in"}
            onAction={readOnly ? undefined : () => setWalkInOpen(true)}
          />
        ) : (
          <ol className="grid gap-2">
            {queue.waiting.map((appt, i) => {
              const customer = customerById(data, appt.customerId);
              const preferred = STAFF.find((s) => s.id === appt.staffId);
              return (
                <li
                  key={appt.id}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-sm font-semibold">
                    {i + 1}
                  </span>
                  {customer && (
                    <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="sm" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{customer?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {serviceNames(appt.serviceIds)} ·{" "}
                      {preferred ? preferred.name : "Any barber"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="rounded-full bg-warning/15 px-2 py-1 text-[11px] font-medium text-warning-foreground dark:text-warning">
                      ~{appt.estimatedWaitMin ?? 10} min
                    </span>
                    {!readOnly && (
                      <>
                        {/* Primary action: start with assigned/available barber */}
                        <Button
                          size="sm"
                          variant="default"
                          className="hidden sm:inline-flex"
                          onClick={() => {
                            let sid = appt.staffId;
                            if (!sid) {
                              const free = freeStaff[0];
                              if (!free) {
                                toast.info("No barber free right now", {
                                  description: "Complete a running service first.",
                                });
                                return;
                              }
                              sid = free.staff.id;
                              assignStaff(appt.id, sid);
                            }
                            startService(appt.id);
                            toast.success(
                              `${customer?.name} → ${STAFF.find((s) => s.id === sid)?.name}`,
                              { description: "Service started." }
                            );
                          }}
                        >
                          <Play className="size-3.5" aria-hidden />
                          Start
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-9"
                              aria-label={`Actions for ${customer?.name}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Assign & start</DropdownMenuLabel>
                            {queue.staffState
                              .filter((s) => s.state === "free" || s.staff.id === appt.staffId)
                              .map(({ staff }) => (
                                <DropdownMenuItem
                                  key={staff.id}
                                  onClick={() => {
                                    assignStaff(appt.id, staff.id);
                                    startService(appt.id);
                                    toast.success(
                                      `${customer?.name} → ${staff.name}`,
                                      { description: "Service started." }
                                    );
                                  }}
                                >
                                  <Play className="size-4" />
                                  Start with {staff.name}
                                </DropdownMenuItem>
                              ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                markNoShow(appt.id);
                                toast("Marked as no-show");
                              }}
                            >
                              <UserRoundX className="size-4" />
                              Mark no-show
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                cancelAppointment(appt.id, "Removed from queue");
                                toast("Removed from queue");
                              }}
                            >
                              Remove from queue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Ready for checkout */}
      {!readOnly && <ReadyForCheckout branchId={branchId} posHrefBase={posHrefBase} />}

      <WalkInSheet open={walkInOpen} onOpenChange={setWalkInOpen} branchId={branchId} />
    </div>
  );
}

function ReadyForCheckout({
  branchId,
  posHrefBase,
}: {
  branchId: string;
  posHrefBase: string;
}) {
  const data = useDemoStore((s) => s.data);
  const today = new Date().toDateString();
  const unpaid = data.appointments.filter(
    (a) =>
      a.branchId === branchId &&
      a.status === "completed" &&
      !a.invoiceId &&
      new Date(a.completedAt ?? a.start).toDateString() === today
  );
  if (unpaid.length === 0) return null;
  return (
    <section aria-label="Ready for checkout">
      <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Ready for checkout ({unpaid.length})
      </h2>
      <div className="grid gap-2 lg:grid-cols-2">
        {unpaid.map((appt) => {
          const customer = customerById(data, appt.customerId);
          return (
            <div
              key={appt.id}
              className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/5 p-3.5"
            >
              {customer && (
                <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="sm" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{customer?.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {serviceNames(appt.serviceIds)} · unpaid
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href={`${posHrefBase}?appointment=${appt.id}` as "/"}>
                  <CreditCard className="size-4" aria-hidden />
                  Checkout
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function BreakToggle({ staffId }: { staffId: string }) {
  const data = useDemoStore((s) => s.data);
  const toggleBreak = useDemoStore((s) => s.toggleBreak);
  const todayKey = new Date().toISOString().slice(0, 10);
  const shift = data.shifts.find((s) => s.staffId === staffId && s.date === todayKey);
  const onBreak = shift?.status === "break";
  return (
    <Button
      variant={onBreak ? "default" : "outline"}
      size="sm"
      onClick={() => {
        toggleBreak(staffId);
        toast(onBreak ? "Back from break" : "Break started");
      }}
    >
      <Coffee className="size-4" aria-hidden />
      {onBreak ? "End break" : "Take break"}
    </Button>
  );
}
