"use client";

// The phone-call workflow (Demo V1.1 §35): customer calls → barber taps
// + Appointment → name → service chip → suggested slot → Save. Target is
// under 20 seconds with minimal keyboard. Slots come from the real
// scheduling engine, so even call-only shops get intelligent availability.

import { useMemo, useState } from "react";
import { addDays, format, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Check, Phone, Plus, UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore, durationForSelection, priceForSelection } from "@/lib/store";
import { staffForBranch } from "@/lib/selectors";
import { ALL_SERVICES } from "@/lib/data/seed-static";
import {
  availableSlotsAnyStaff,
  availableSlotsForStaff,
  type Slot,
} from "@/lib/availability";
import { inr, durationLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AddAppointmentSheet({
  open,
  onOpenChange,
  presetStart,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** When tapping a FREE gap on the schedule, preselect that time. */
  presetStart?: Date | null;
}) {
  const data = useDemoStore((s) => s.data);
  const createBooking = useDemoStore((s) => s.createBooking);
  const upsertCustomer = useDemoStore((s) => s.upsertCustomer);

  const branchId = data.branchId;
  const roster = staffForBranch(data, branchId, { activeOn: new Date() });
  const owner = roster.find((s) => s.title.includes("Owner"));
  const solo = roster.length <= 1;

  const [query, setQuery] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string | null>(owner?.id ?? null);
  const [dayOffset, setDayOffset] = useState(0);
  const [slot, setSlot] = useState<Slot | null>(null);

  const services = ALL_SERVICES.filter((s) => s.branchIds.includes(branchId));

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return data.customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
      .slice(0, 4);
  }, [data.customers, query]);

  const selected = data.customers.find((c) => c.id === customerId);
  const isNewCustomer = !selected && query.trim().length > 1;

  const day = addDays(startOfDay(new Date()), dayOffset);
  const allSlots = (() => {
    if (serviceIds.length === 0) return [];
    if (staffId === null)
      return availableSlotsAnyStaff(data, branchId, day, serviceIds);
    const st = roster.find((s) => s.id === staffId);
    return st ? availableSlotsForStaff(data, st, day, serviceIds) : [];
  })();
  const slots = allSlots.slice(0, 9);

  // A tap on a FREE gap pre-selects the matching engine slot — derived, not
  // synced via effect, so the user's own pick always wins.
  const presetSlot =
    presetStart && dayOffset === 0
      ? allSlots.find(
          (s) => Math.abs(s.start.getTime() - presetStart.getTime()) < 60_000
        ) ?? null
      : null;
  const effectiveSlot = slot ?? presetSlot;

  const reset = () => {
    setQuery("");
    setCustomerId(null);
    setNewPhone("");
    setServiceIds([]);
    setStaffId(owner?.id ?? null);
    setDayOffset(0);
    setSlot(null);
  };

  const canSave =
    (selected || isNewCustomer) && serviceIds.length > 0 && effectiveSlot;

  const save = () => {
    if (!effectiveSlot) return;
    let cid = customerId;
    if (!cid) {
      cid = `cu_manual_${Date.now().toString(36)}`;
      upsertCustomer({
        id: cid,
        userId: `user_${cid}`,
        name: query.trim(),
        phone: newPhone.trim(),
        avatarTone: "clay",
        homeBranchId: branchId,
        preferences: [],
        notes: "",
        tags: ["new"],
        joinedAt: new Date().toISOString(),
        favoriteBranchIds: [branchId],
        favoriteServiceIds: serviceIds.slice(0, 1),
        language: "en",
      });
    }
    const appt = createBooking({
      branchId,
      customerId: cid,
      staffId: staffId ?? effectiveSlot.staffId,
      serviceIds,
      addonIds: [],
      start: effectiveSlot.start.toISOString(),
      paymentPreference: "pay-at-shop",
      source: "phone",
    });
    toast.success(`${selected?.name ?? query.trim()} · ${format(new Date(appt.start), "h:mm a")}`, {
      description: "Appointment added.",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
      title="Add appointment"
      description="For phone or WhatsApp bookings"
      contentClassName="sm:max-w-lg"
    >
      <div className="grid gap-4 pb-4">
        {/* Customer */}
        {selected ? (
          <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary/5 p-3">
            <ToneAvatar name={selected.name} toneName={selected.avatarTone} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{selected.name}</p>
              {selected.phone && (
                <p className="text-xs text-muted-foreground">{selected.phone}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCustomerId(null);
                setQuery("");
              }}
            >
              Change
            </Button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                placeholder="Customer name or phone…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-9"
                autoFocus
              />
            </div>
            {matches.length > 0 && (
              <div className="mt-1.5 grid gap-1 rounded-xl border p-1.5">
                {matches.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCustomerId(c.id)}
                    className="flex items-center gap-2.5 rounded-lg p-2 text-left hover:bg-muted"
                  >
                    <ToneAvatar name={c.name} toneName={c.avatarTone} size="xs" />
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{c.phone}</span>
                  </button>
                ))}
              </div>
            )}
            {isNewCustomer && matches.length === 0 && (
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-dashed p-2.5">
                <UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="text-xs text-muted-foreground">
                  New customer &ldquo;{query.trim()}&rdquo;
                </span>
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="Phone (optional)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="ml-auto h-9 w-40"
                />
              </div>
            )}
          </div>
        )}

        {/* Service chips */}
        <div className="flex flex-wrap gap-1.5">
          {services.map((svc) => {
            const active = serviceIds.includes(svc.id);
            return (
              <button
                key={svc.id}
                onClick={() => {
                  setServiceIds((prev) =>
                    active ? prev.filter((x) => x !== svc.id) : [...prev, svc.id]
                  );
                  setSlot(null);
                }}
                aria-pressed={active}
                className={cn(
                  "flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted"
                )}
              >
                {active ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                {svc.name} · {inr(svc.price)}
              </button>
            );
          })}
        </div>

        {/* Barber (hidden entirely for solo — "Me" is implicit) */}
        {!solo && (
          <div className="flex flex-wrap gap-1.5">
            {roster.map((st) => {
              const active = staffId === st.id;
              const isOwner = st.id === owner?.id;
              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setStaffId(st.id);
                    setSlot(null);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-sm font-medium",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card hover:bg-muted"
                  )}
                >
                  {isOwner ? "Me" : st.name}
                </button>
              );
            })}
            <button
              onClick={() => {
                setStaffId(null);
                setSlot(null);
              }}
              aria-pressed={staffId === null}
              className={cn(
                "flex items-center gap-1 rounded-full border px-3.5 py-2 text-sm font-medium",
                staffId === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted"
              )}
            >
              <Zap className="size-3.5" aria-hidden />
              Any
            </button>
          </div>
        )}

        {/* Day + slots */}
        {serviceIds.length > 0 && (
          <div>
            <div className="mb-2 flex gap-1.5">
              {[0, 1, 2].map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    setDayOffset(o);
                    setSlot(null);
                  }}
                  aria-pressed={dayOffset === o}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium",
                    dayOffset === o
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card"
                  )}
                >
                  {o === 0 ? "Today" : o === 1 ? "Tomorrow" : format(addDays(new Date(), o), "EEE d")}
                </button>
              ))}
            </div>
            {slots.length === 0 ? (
              <p className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">
                No open slots {dayOffset === 0 ? "left today" : "that day"} — try
                another day.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {slots.map((s) => {
                  const active = effectiveSlot?.start.getTime() === s.start.getTime();
                  return (
                    <button
                      key={s.start.toISOString()}
                      onClick={() => setSlot(s)}
                      aria-pressed={active}
                      className={cn(
                        "min-h-11 rounded-lg border text-sm font-medium",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-card hover:border-primary/50"
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Save */}
        <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">
            {serviceIds.length > 0
              ? `${durationLabel(durationForSelection(serviceIds, []))}`
              : "Pick a service"}
          </span>
          <span className="font-heading font-semibold">
            {inr(priceForSelection(serviceIds, []))}
          </span>
        </div>
        <Button size="lg" className="h-12" disabled={!canSave} onClick={save}>
          Add appointment
        </Button>
      </div>
    </BottomSheet>
  );
}
