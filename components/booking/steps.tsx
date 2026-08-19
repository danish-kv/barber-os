"use client";

// Individual steps of the mobile-first booking flow.

import { useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { Check, ChevronRight, Clock, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { useDemoStore } from "@/lib/store";
import { SERVICES, ADDONS, STAFF } from "@/lib/data/seed-static";
import {
  availableSlotsAnyStaff,
  availableSlotsForStaff,
  nextAvailableLabel,
  type Slot,
} from "@/lib/availability";
import { inr, durationLabel } from "@/lib/format";
import { t, type I18nKey } from "@/lib/i18n";
import type { Language, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------

export function ServiceStep({
  branchId,
  selected,
  onToggle,
  lang,
}: {
  branchId: string;
  selected: string[];
  onToggle: (id: string) => void;
  lang: Language;
}) {
  const services = SERVICES.filter((s) => s.branchIds.includes(branchId));
  const byCategory = new Map<string, Service[]>();
  const order = ["hair", "beard", "spa", "color", "kids", "styling"];
  for (const s of services) {
    if (!byCategory.has(s.category)) byCategory.set(s.category, []);
    byCategory.get(s.category)!.push(s);
  }
  const CATEGORY_LABEL: Record<string, string> = {
    hair: "Hair",
    beard: "Beard",
    spa: "Spa & Relax",
    color: "Colour",
    kids: "Kids",
    styling: "Styling",
  };

  return (
    <div className="grid gap-5">
      {order
        .filter((c) => byCategory.has(c))
        .map((cat) => (
          <div key={cat}>
            <h3 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {CATEGORY_LABEL[cat]}
            </h3>
            <div className="grid gap-2">
              {byCategory.get(cat)!.map((service) => {
                const isSelected = selected.includes(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => onToggle(service.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex min-h-16 items-center gap-3 rounded-xl border bg-card p-3.5 text-left transition-all active:scale-[0.99]",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-border hover:bg-muted/40"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {lang === "ml" && service.nameMl ? service.nameMl : service.name}
                        {service.popular && (
                          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                            {t("book.popular", lang)}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" aria-hidden />
                        {durationLabel(service.durationMin)}
                        <span aria-hidden>·</span>
                        <span className="font-medium text-foreground">{inr(service.price)}</span>
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {isSelected ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <Plus className="size-4" aria-hidden />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function AddonStep({
  serviceIds,
  selected,
  onToggle,
}: {
  serviceIds: string[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const availableAddonIds = new Set(
    serviceIds.flatMap((id) => SERVICES.find((s) => s.id === id)?.addonIds ?? [])
  );
  const addons = ADDONS.filter((a) => availableAddonIds.has(a.id));
  if (addons.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Add-ons
      </h3>
      <div className="grid gap-2">
        {addons.map((addon) => {
          const isSelected = selected.includes(addon.id);
          return (
            <button
              key={addon.id}
              onClick={() => onToggle(addon.id)}
              aria-pressed={isSelected}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-xl border bg-card px-3.5 py-2.5 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "hover:bg-muted/40"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{addon.name}</p>
                <p className="text-xs text-muted-foreground">
                  +{durationLabel(addon.durationMin)} · {inr(addon.price)}
                </p>
              </div>
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {isSelected ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function BarberStep({
  branchId,
  serviceIds,
  selectedStaffId,
  anySelected,
  onSelect,
  lang,
}: {
  branchId: string;
  serviceIds: string[];
  selectedStaffId: string | null;
  anySelected: boolean;
  onSelect: (staffId: string | null) => void;
  lang: Language;
}) {
  const data = useDemoStore((s) => s.data);
  const eligible = STAFF.filter(
    (st) =>
      st.branchId === branchId &&
      serviceIds.every((id) => st.serviceIds.includes(id))
  );

  return (
    <div className="grid gap-2">
      <button
        onClick={() => onSelect(null)}
        aria-pressed={anySelected}
        className={cn(
          "flex min-h-16 items-center gap-3 rounded-xl border-2 border-dashed bg-card p-3.5 text-left transition-all",
          anySelected
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted/40"
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Zap className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t("book.anyBarber", lang)}</p>
          <p className="text-xs text-muted-foreground">{t("book.fastest", lang)}</p>
        </div>
        {anySelected && <Check className="size-5 text-primary" aria-hidden />}
      </button>

      {eligible.map((staff) => {
        const isSelected = selectedStaffId === staff.id && !anySelected;
        const next = nextAvailableLabel(data, staff, serviceIds);
        return (
          <button
            key={staff.id}
            onClick={() => onSelect(staff.id)}
            aria-pressed={isSelected}
            className={cn(
              "flex min-h-18 items-center gap-3 rounded-xl border bg-card p-3.5 text-left transition-all active:scale-[0.99]",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-muted/40"
            )}
          >
            <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {staff.name}
                <StarRating rating={staff.rating} size="xs" />
              </p>
              <p className="text-xs text-muted-foreground">
                {staff.title} · {staff.experienceYears} {t("shop.experience", lang)}
              </p>
              {next && (
                <p className="mt-0.5 text-xs font-medium text-success">
                  Next available: {next}
                </p>
              )}
            </div>
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              {isSelected ? (
                <Check className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function TimeStep({
  branchId,
  staffId,
  anyStaff,
  serviceIds,
  addonIds,
  selectedSlot,
  onSelectSlot,
  onJoinWaitlist,
  lang,
}: {
  branchId: string;
  staffId: string | null;
  anyStaff: boolean;
  serviceIds: string[];
  addonIds: string[];
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
  onJoinWaitlist: (date: Date) => void;
  lang: Language;
}) {
  const data = useDemoStore((s) => s.data);
  const [dayOffset, setDayOffset] = useState(0);
  const today = startOfDay(new Date());

  const days = useMemo(
    () => Array.from({ length: 10 }, (_, i) => addDays(today, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const selectedDay = days[dayOffset];

  const slots = useMemo(() => {
    if (anyStaff || !staffId) {
      return availableSlotsAnyStaff(data, branchId, selectedDay, serviceIds, addonIds);
    }
    const staff = STAFF.find((s) => s.id === staffId);
    if (!staff) return [];
    return availableSlotsForStaff(data, staff, selectedDay, serviceIds, addonIds);
  }, [data, branchId, staffId, anyStaff, selectedDay, serviceIds, addonIds]);

  const byPeriod: Record<string, Slot[]> = { morning: [], afternoon: [], evening: [] };
  for (const s of slots) byPeriod[s.period].push(s);

  const PERIOD_LABEL: Record<string, I18nKey> = {
    morning: "book.morning",
    afternoon: "book.afternoon",
    evening: "book.evening",
  };

  return (
    <div>
      {/* Horizontally scrollable day picker */}
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar"
        role="tablist"
        aria-label="Choose date"
      >
        {days.map((day, i) => {
          const active = i === dayOffset;
          return (
            <button
              key={day.toISOString()}
              role="tab"
              aria-selected={active}
              onClick={() => setDayOffset(i)}
              className={cn(
                "flex min-w-14 shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted/40"
              )}
            >
              <span className={cn("text-[10px] font-medium uppercase", active ? "opacity-90" : "text-muted-foreground")}>
                {isSameDay(day, today) ? "Today" : format(day, "EEE")}
              </span>
              <span className="font-heading text-lg font-semibold">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>

      {slots.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed p-6 text-center">
          <p className="text-sm font-medium">{t("book.noSlots", lang)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {format(selectedDay, "EEEE d MMM")} is fully booked
            {staffId && !anyStaff
              ? ` for ${STAFF.find((s) => s.id === staffId)?.name}`
              : ""}
            . Join the waitlist and we&apos;ll notify you if a slot opens.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => onJoinWaitlist(selectedDay)}
          >
            {t("book.joinWaitlist", lang)}
          </Button>
        </div>
      ) : (
        <div className="mt-3 grid gap-4">
          {(["morning", "afternoon", "evening"] as const).map((period) => {
            const periodSlots = byPeriod[period];
            if (periodSlots.length === 0) return null;
            return (
              <div key={period}>
                <h4 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  {t(PERIOD_LABEL[period], lang)}
                </h4>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {periodSlots.map((slot) => {
                    const active =
                      selectedSlot?.start.getTime() === slot.start.getTime();
                    return (
                      <button
                        key={slot.start.toISOString()}
                        onClick={() => onSelectSlot(slot)}
                        aria-pressed={active}
                        className={cn(
                          "relative min-h-11 rounded-lg border text-sm font-medium transition-all active:scale-95",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-card hover:border-primary/50",
                          slot.demand === "almost-full" && !active && "border-warning/60"
                        )}
                      >
                        {slot.label}
                        {slot.demand === "almost-full" && (
                          <span
                            className={cn(
                              "absolute -top-1.5 right-1 rounded-full px-1 text-[8px] font-semibold",
                              active
                                ? "bg-primary-foreground text-primary"
                                : "bg-warning text-warning-foreground"
                            )}
                          >
                            {t("book.almostFull", lang)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="text-center text-[11px] text-muted-foreground">
            <span className="mr-3 inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-sm border bg-card" /> {t("book.available", lang)}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-sm border border-warning/60 bg-card" /> {t("book.almostFull", lang)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function PaymentStep({
  total,
  preference,
  onPreference,
  guestName,
  guestPhone,
  onGuestName,
  onGuestPhone,
  needGuestDetails,
  lang,
}: {
  total: number;
  preference: "advance" | "full" | "pay-at-shop";
  onPreference: (p: "advance" | "full" | "pay-at-shop") => void;
  guestName: string;
  guestPhone: string;
  onGuestName: (v: string) => void;
  onGuestPhone: (v: string) => void;
  needGuestDetails: boolean;
  lang: Language;
}) {
  return (
    <div className="grid gap-5">
      {needGuestDetails && (
        <div className="grid gap-3">
          <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Your details
          </h3>
          <div className="grid gap-1.5">
            <Label htmlFor="guest-name">Name</Label>
            <Input
              id="guest-name"
              autoComplete="name"
              placeholder="Your name"
              value={guestName}
              onChange={(e) => onGuestName(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="guest-phone">Phone</Label>
            <Input
              id="guest-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98470 00000"
              value={guestPhone}
              onChange={(e) => onGuestPhone(e.target.value)}
              className="h-11"
            />
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {t("book.payment", lang)}
        </h3>
        <RadioGroup
          value={preference}
          onValueChange={(v) => onPreference(v as typeof preference)}
          className="grid gap-2"
        >
          {(
            [
              {
                value: "advance",
                title: t("book.payAdvance", lang),
                detail: `${inr(100)} now · ${inr(Math.max(0, total - 100))} at shop`,
              },
              {
                value: "full",
                title: t("book.payFull", lang),
                detail: `${inr(total)} via UPI now`,
              },
              {
                value: "pay-at-shop",
                title: t("book.payAtShop", lang),
                detail: `${inr(total)} after your service`,
              },
            ] as const
          ).map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`pay-${opt.value}`}
              className={cn(
                "flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border bg-card p-3.5 transition-colors",
                preference === opt.value && "border-primary bg-primary/5 ring-1 ring-primary"
              )}
            >
              <RadioGroupItem id={`pay-${opt.value}`} value={opt.value} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{opt.title}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {opt.detail}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Payments are simulated in this demo — no real money moves.
        </p>
      </div>
    </div>
  );
}
