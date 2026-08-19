"use client";

// Rich customer profile — used by the barber view and (with a different
// wrapper/back link) by owner/reception views.

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarPlus,
  MessageCircle,
  NotebookPen,
  Phone,
  Sparkles,
  UserRoundX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import {
  customerStats,
  historyForCustomer,
  serviceNames,
  staffById,
} from "@/lib/selectors";
import { MEMBERSHIP_PLANS } from "@/lib/data/seed-static";
import { dayLabel, inr } from "@/lib/format";

export function CustomerProfile({
  customerId,
  backHref,
  bookHrefBase = "/shops/royal-cuts/book",
}: {
  customerId: string;
  backHref: string;
  bookHrefBase?: string;
}) {
  const data = useDemoStore((s) => s.data);
  const addCustomerNote = useDemoStore((s) => s.addCustomerNote);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const stats = customerStats(data, customerId);
  if (!stats) {
    return (
      <EmptyState
        icon={UserRoundX}
        title="Customer not found"
        description="This profile may have been removed when demo data was reset."
        actionLabel="Back"
        actionHref={backHref}
      />
    );
  }

  const { customer } = stats;
  const history = historyForCustomer(data, customerId);
  const noShows = history.filter((a) => a.status === "no-show").length;
  const cancels = history.filter((a) => a.status === "cancelled").length;
  const loyalty = data.loyaltyAccounts.find((l) => l.customerId === customerId);
  const membership = data.memberships.find(
    (m) => m.customerId === customerId && m.status === "active"
  );
  const plan = membership
    ? MEMBERSHIP_PLANS.find((p) => p.id === membership.planId)
    : undefined;
  const preferredStaff = staffById(customer.preferredStaffId, data);
  const invoices = data.invoices
    .filter((i) => i.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const lastVisit = history.find((a) => a.status === "completed");

  const saveNote = () => {
    if (!noteText.trim()) return;
    addCustomerNote(customerId, noteText.trim());
    toast.success("Note saved");
    setNoteOpen(false);
    setNoteText("");
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="-ml-2 size-9" asChild>
          <Link href={backHref as "/"} aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="font-heading text-xl font-semibold">Customer</h1>
      </div>

      {/* Identity */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="xl" />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-heading text-lg font-semibold">
              {customer.name}
              {customer.tags.includes("vip") && (
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground dark:text-warning">
                  VIP
                </span>
              )}
              {customer.tags.includes("new") && (
                <span className="rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-semibold text-info">
                  NEW
                </span>
              )}
            </p>
            {customer.phone && (
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            )}
            {preferredStaff && (
              <p className="text-xs text-muted-foreground">
                Preferred barber: <strong>{preferredStaff.name}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
          <div>
            <p className="font-heading text-lg font-semibold tabular-nums">{stats.visits}</p>
            <p className="text-[11px] text-muted-foreground">visits</p>
          </div>
          <div>
            <p className="font-heading text-lg font-semibold tabular-nums">
              {inr(stats.lifetimeSpend, { compact: true })}
            </p>
            <p className="text-[11px] text-muted-foreground">lifetime spend</p>
          </div>
          <div>
            <p className="font-heading text-lg font-semibold">
              {lastVisit ? dayLabel(lastVisit.start) : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground">last visit</p>
          </div>
        </div>

        {/* quick actions */}
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setNoteOpen(true)}>
            <NotebookPen className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Note</span>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`tel:${customer.phone.replace(/\s/g, "")}`}
              aria-label={`Call ${customer.name}`}
            >
              <Phone className="size-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">Call</span>
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://wa.me/${customer.phone.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`WhatsApp ${customer.name}`}
            >
              <MessageCircle className="size-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">Chat</span>
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link
              href={
                `${bookHrefBase}?services=${lastVisit?.serviceIds.join(",") ?? ""}&staff=${lastVisit?.staffId ?? customer.preferredStaffId ?? ""}` as "/"
              }
            >
              <CalendarPlus className="size-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">Rebook</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Preferences
        </h2>
        {customer.preferences.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {customer.preferences.map((p) => (
              <span
                key={p}
                className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No preferences recorded yet.
          </p>
        )}
        {customer.notes && (
          <>
            <Separator className="my-3" />
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Notes
            </h3>
            <p className="mt-1.5 text-sm whitespace-pre-line">&ldquo;{customer.notes}&rdquo;</p>
          </>
        )}
      </section>

      {/* Loyalty & membership */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Loyalty</p>
          <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
            {loyalty?.points ?? 0} pts
          </p>
          <p className="text-[11px] text-muted-foreground capitalize">
            {loyalty?.tier ?? "no"} tier · {loyalty?.visitStreak ?? 0} visit streak
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3" aria-hidden /> Membership
          </p>
          {plan ? (
            <>
              <p className="mt-1 truncate text-sm font-semibold">{plan.name}</p>
              <p className="text-[11px] text-success">Active</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">None</p>
          )}
        </div>
      </section>

      {/* Reliability */}
      {(noShows > 0 || cancels > 0) && (
        <p className="rounded-xl bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground">
          {noShows} no-show{noShows === 1 ? "" : "s"} · {cancels} cancellation
          {cancels === 1 ? "" : "s"} on record
        </p>
      )}

      {/* Service history */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Service history
        </h2>
        <ul className="grid gap-1.5">
          {history.slice(0, 12).map((appt) => {
            const st = staffById(appt.staffId, data);
            const invoice = invoices.find((i) => i.appointmentId === appt.id);
            return (
              <li
                key={appt.id}
                className="flex items-center gap-3 rounded-xl border bg-card px-3.5 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{serviceNames(appt.serviceIds)}</p>
                  <p className="text-xs text-muted-foreground">
                    {dayLabel(appt.start)}
                    {st && ` · ${st.name}`}
                    {invoice && ` · ${inr(invoice.total)}`}
                  </p>
                </div>
                <StatusBadge status={appt.status} />
              </li>
            );
          })}
          {history.length === 0 && (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              First visit — no history yet.
            </p>
          )}
        </ul>
      </section>

      <BottomSheet
        open={noteOpen}
        onOpenChange={setNoteOpen}
        title={`Note for ${customer.name}`}
      >
        <div className="grid gap-3 pb-4">
          <Textarea
            placeholder="e.g. Prefers minimal styling product."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
          />
          <Button onClick={saveNote} disabled={!noteText.trim()}>
            Save note
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
