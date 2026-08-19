"use client";

// The centerpiece booking experience. Mobile-first, progressive steps,
// persistent summary, simulated UPI, premium confirmation.

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Share2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore, priceForSelection, durationForSelection } from "@/lib/store";
import { SERVICES, ADDONS, STAFF, BRANCHES } from "@/lib/data/seed-static";
import type { Slot } from "@/lib/availability";
import { inr, durationLabel } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Appointment, Language } from "@/lib/types";
import {
  AddonStep,
  BarberStep,
  PaymentStep,
  ServiceStep,
  TimeStep,
} from "./steps";

type Step = "services" | "barber" | "time" | "payment";
const STEP_ORDER: Step[] = ["services", "barber", "time", "payment"];

export function BookingFlow({
  branchId = "br_kakkanad",
  preselectServiceIds = [],
  preselectStaffId,
  onDone,
  backHref,
}: {
  branchId?: string;
  preselectServiceIds?: string[];
  preselectStaffId?: string | null;
  onDone?: (appointmentId: string) => void;
  backHref?: string;
}) {
  const session = useDemoStore((s) => s.session);
  const createBooking = useDemoStore((s) => s.createBooking);
  const joinWaitlist = useDemoStore((s) => s.joinWaitlist);
  const upsertCustomer = useDemoStore((s) => s.upsertCustomer);
  const customers = useDemoStore((s) => s.data.customers);
  const lang: Language = session.language;

  const [step, setStep] = useState<Step>(
    preselectServiceIds.length > 0 ? "barber" : "services"
  );
  const [serviceIds, setServiceIds] = useState<string[]>(preselectServiceIds);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string | null>(preselectStaffId ?? null);
  const [anyStaff, setAnyStaff] = useState(preselectStaffId === null);
  const [barberChosen, setBarberChosen] = useState(preselectStaffId !== undefined);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [preference, setPreference] = useState<"advance" | "full" | "pay-at-shop">("advance");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [payPhase, setPayPhase] = useState<"idle" | "processing" | "success">("idle");
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);

  const branch = BRANCHES.find((b) => b.id === branchId)!;
  const isCustomerSession = session.role === "customer";
  const totalPrice = priceForSelection(serviceIds, addonIds);
  const totalDuration = durationForSelection(serviceIds, addonIds);

  const stepIndex = STEP_ORDER.indexOf(step);
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;

  const serviceNames = useMemo(
    () =>
      serviceIds
        .map((id) => {
          const s = SERVICES.find((sv) => sv.id === id);
          return lang === "ml" && s?.nameMl ? s.nameMl : s?.name;
        })
        .filter(Boolean)
        .join(" + "),
    [serviceIds, lang]
  );

  const canContinue =
    step === "services"
      ? serviceIds.length > 0
      : step === "barber"
        ? barberChosen
        : step === "time"
          ? slot !== null
          : isCustomerSession || (guestName.trim().length > 1 && guestPhone.trim().length >= 10);

  const toggleService = (id: string) => {
    setServiceIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next;
    });
    setSlot(null);
  };

  const toggleAddon = (id: string) =>
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectBarber = (id: string | null) => {
    setStaffId(id);
    setAnyStaff(id === null);
    setBarberChosen(true);
    setSlot(null);
  };

  const goNext = () => {
    if (step === "payment") {
      startPayment();
      return;
    }
    setStep(STEP_ORDER[stepIndex + 1]);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEP_ORDER[stepIndex - 1]);
  };

  const resolveCustomerId = (): string => {
    if (isCustomerSession) return "cu_danish";
    // Guest booking from the public page — create a lightweight customer.
    const existing = customers.find(
      (c) => c.phone.replace(/\s/g, "") === guestPhone.replace(/\s/g, "") && guestPhone
    );
    if (existing) return existing.id;
    const id = `cu_guest_${Date.now().toString(36)}`;
    upsertCustomer({
      id,
      userId: `user_${id}`,
      name: guestName.trim() || "Guest",
      phone: guestPhone.trim(),
      avatarTone: "clay",
      homeBranchId: branchId,
      preferences: [],
      notes: "",
      tags: ["new"],
      joinedAt: new Date().toISOString(),
      favoriteBranchIds: [branchId],
      favoriteServiceIds: serviceIds.slice(0, 1),
      language: lang,
    });
    return id;
  };

  const finalizeBooking = () => {
    if (!slot) return;
    const resolvedStaffId = anyStaff ? slot.staffId : staffId;
    const appt = createBooking({
      branchId,
      customerId: resolveCustomerId(),
      staffId: resolvedStaffId,
      serviceIds,
      addonIds,
      start: slot.start.toISOString(),
      paymentPreference: preference,
    });
    setConfirmed(appt);
    setPaying(false);
    setPayPhase("idle");
    onDone?.(appt.id);
  };

  const startPayment = () => {
    if (preference === "pay-at-shop") {
      finalizeBooking();
      toast.success(t("book.confirmed", lang));
      return;
    }
    setPaying(true);
    setPayPhase("processing");
    setTimeout(() => {
      setPayPhase("success");
      setTimeout(() => {
        finalizeBooking();
        toast.success(t("book.confirmed", lang));
      }, 900);
    }, 1600);
  };

  const handleWaitlist = (date: Date) => {
    joinWaitlist({
      branchId,
      customerId: resolveCustomerId(),
      staffId: anyStaff ? null : staffId,
      serviceIds,
      desiredDate: format(date, "yyyy-MM-dd"),
      desiredWindow: "6:00 PM",
    });
    toast.success("Added to waitlist", {
      description: "We'll notify you the moment a slot opens.",
    });
  };

  // ------------------------------ CONFIRMED ------------------------------
  if (confirmed) {
    return (
      <ConfirmationScreen
        appointment={confirmed}
        branchName={branch.name}
        serviceNames={serviceNames}
        totalPrice={totalPrice}
        lang={lang}
      />
    );
  }

  const STEP_TITLE: Record<Step, string> = {
    services: t("book.chooseServices", lang),
    barber: t("book.chooseBarber", lang),
    time: t("book.chooseTime", lang),
    payment: t("book.payment", lang),
  };

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          {stepIndex > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 size-9"
              onClick={goBack}
              aria-label={t("book.back", lang)}
            >
              <ArrowLeft className="size-5" />
            </Button>
          ) : backHref ? (
            <Button variant="ghost" size="icon" className="-ml-2 size-9" asChild>
              <Link href={backHref as "/"} aria-label={t("book.back", lang)}>
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              Royal Cuts · {branch.name}
            </p>
            <h2 className="font-heading text-lg font-semibold">{STEP_TITLE[step]}</h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {stepIndex + 1}/{STEP_ORDER.length}
          </span>
        </div>
        <Progress value={progress} className="mt-3 h-1" />
      </div>

      {/* Steps */}
      {step === "services" && (
        <>
          <ServiceStep
            branchId={branchId}
            selected={serviceIds}
            onToggle={toggleService}
            lang={lang}
          />
          <AddonStep
            serviceIds={serviceIds}
            selected={addonIds}
            onToggle={toggleAddon}
          />
        </>
      )}
      {step === "barber" && (
        <BarberStep
          branchId={branchId}
          serviceIds={serviceIds}
          selectedStaffId={staffId}
          anySelected={anyStaff && barberChosen}
          onSelect={selectBarber}
          lang={lang}
        />
      )}
      {step === "time" && (
        <TimeStep
          branchId={branchId}
          staffId={staffId}
          anyStaff={anyStaff}
          serviceIds={serviceIds}
          addonIds={addonIds}
          selectedSlot={slot}
          onSelectSlot={setSlot}
          onJoinWaitlist={handleWaitlist}
          lang={lang}
        />
      )}
      {step === "payment" && (
        <>
          <ReviewCard
            serviceNames={serviceNames}
            staffName={
              anyStaff
                ? t("book.anyBarber", lang)
                : STAFF.find((s) => s.id === staffId)?.name ?? ""
            }
            slot={slot}
            totalPrice={totalPrice}
            totalDuration={totalDuration}
            addonIds={addonIds}
          />
          <div className="mt-5">
            <PaymentStep
              total={totalPrice}
              preference={preference}
              onPreference={setPreference}
              guestName={guestName}
              guestPhone={guestPhone}
              onGuestName={setGuestName}
              onGuestPhone={setGuestPhone}
              needGuestDetails={!isCustomerSession}
              lang={lang}
            />
          </div>
        </>
      )}

      {/* Sticky summary + CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85 pb-safe">
        <div className="mx-auto max-w-lg px-4 py-3 md:max-w-3xl">
          {serviceIds.length > 0 && (
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">
                {serviceIds.length} {t("book.services", lang)} ·{" "}
                {durationLabel(totalDuration)}
                {slot ? ` · ${format(slot.start, "EEE d MMM, h:mm a")}` : ""}
              </span>
              <span className="ml-2 shrink-0 font-heading text-base font-semibold text-foreground">
                {inr(totalPrice)}
              </span>
            </div>
          )}
          <Button
            size="lg"
            className="h-12 w-full text-base"
            disabled={!canContinue}
            onClick={goNext}
          >
            {step === "payment"
              ? preference === "advance"
                ? t("book.payAdvance", lang)
                : preference === "full"
                  ? `Pay ${inr(totalPrice)} · UPI`
                  : t("book.confirm", lang)
              : t("book.continue", lang)}
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      {/* Simulated UPI sheet */}
      <BottomSheet
        open={paying}
        onOpenChange={(o) => {
          if (!o && payPhase === "processing") return; // don't dismiss mid-payment
          setPaying(o);
        }}
        title="UPI Payment"
        description="Simulated payment — no real money moves"
      >
        <div className="flex flex-col items-center py-6">
          {payPhase === "processing" ? (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-info/10">
                <Smartphone className="size-7 animate-pulse text-info" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-medium">Waiting for UPI approval…</p>
              <p className="mt-1 text-xs text-muted-foreground">
                royal.cuts@ybl · {inr(preference === "advance" ? 100 : totalPrice)}
              </p>
              <Loader2 className="mt-4 size-5 animate-spin text-muted-foreground" aria-hidden />
            </>
          ) : (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-success/10">
                <Check className="size-8 text-success" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold">Payment successful</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {inr(preference === "advance" ? 100 : totalPrice)} paid via UPI
              </p>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ReviewCard({
  serviceNames,
  staffName,
  slot,
  totalPrice,
  totalDuration,
  addonIds,
}: {
  serviceNames: string;
  staffName: string;
  slot: Slot | null;
  totalPrice: number;
  totalDuration: number;
  addonIds: string[];
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Booking summary
      </h3>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Services</dt>
          <dd className="text-right font-medium">{serviceNames}</dd>
        </div>
        {addonIds.length > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Add-ons</dt>
            <dd className="text-right font-medium">
              {addonIds
                .map((id) => ADDONS.find((a) => a.id === id)?.name)
                .filter(Boolean)
                .join(", ")}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Barber</dt>
          <dd className="font-medium">{staffName}</dd>
        </div>
        {slot && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Time</dt>
            <dd className="font-medium">{format(slot.start, "EEE d MMM · h:mm a")}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="font-medium">{durationLabel(totalDuration)}</dd>
        </div>
        <div className="mt-1 flex justify-between gap-4 border-t pt-2">
          <dt className="font-medium">Total</dt>
          <dd className="font-heading text-base font-semibold">{inr(totalPrice)}</dd>
        </div>
      </dl>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ConfirmationScreen({
  appointment,
  branchName,
  serviceNames,
  totalPrice,
  lang,
}: {
  appointment: Appointment;
  branchName: string;
  serviceNames: string;
  totalPrice: number;
  lang: Language;
}) {
  const staff = STAFF.find((s) => s.id === appointment.staffId);
  const advance = appointment.advancePaid ? appointment.advanceAmount ?? 0 : 0;
  const fullPaid = appointment.paymentPreference === "full";
  const balance = fullPaid ? 0 : Math.max(0, totalPrice - advance);
  const start = new Date(appointment.start);

  const share = async () => {
    const text = `Booked at Royal Cuts ${branchName}: ${serviceNames} with ${staff?.name ?? "any barber"} on ${format(start, "d MMM, h:mm a")}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Royal Cuts booking", text });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied booking details");
    }
  };

  const calendarUrl = (() => {
    const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `Royal Cuts — ${serviceNames}`,
      dates: `${fmt(start)}/${fmt(new Date(appointment.end))}`,
      details: `With ${staff?.name ?? "any barber"} at Royal Cuts ${branchName}`,
      location: `Royal Cuts, ${branchName}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })();

  return (
    <div className="flex flex-col items-center pt-6 pb-10 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-success/10 animate-in zoom-in-50 duration-300">
        <Check className="size-10 text-success" aria-hidden />
      </span>
      <h2 className="mt-5 font-heading text-2xl font-semibold">
        {t("book.confirmed", lang)}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Royal Cuts · {branchName}</p>

      <div className="mt-6 w-full max-w-sm rounded-2xl border bg-card p-5 text-left shadow-xs">
        <div className="flex items-center gap-3">
          {staff && <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="lg" />}
          <div className="min-w-0">
            <p className="font-heading text-base font-semibold">{serviceNames}</p>
            <p className="text-sm text-muted-foreground">
              {staff ? staff.name : t("book.anyBarber", lang)}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium">{format(start, "EEE, d MMM")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="font-medium">{format(start, "h:mm a")}</p>
          </div>
          {(advance > 0 || fullPaid) && (
            <div>
              <p className="text-xs text-muted-foreground">{t("book.advancePaid", lang)}</p>
              <p className="font-medium text-success">
                {inr(fullPaid ? totalPrice : advance)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">{t("book.balanceAtShop", lang)}</p>
            <p className="font-medium">{inr(balance)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <a href={calendarUrl} target="_blank" rel="noreferrer">
            <CalendarPlus className="size-4" aria-hidden />
            {t("book.addToCalendar", lang)}
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href="https://maps.google.com/?q=Royal+Cuts+Kakkanad+Kochi"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin className="size-4" aria-hidden />
            {t("book.getDirections", lang)}
          </a>
        </Button>
        <Button variant="outline" onClick={share}>
          <Share2 className="size-4" aria-hidden />
          {t("book.share", lang)}
        </Button>
        <Button asChild>
          <Link href={`/customer/bookings/${appointment.id}` as "/"}>
            {t("book.viewBooking", lang)}
          </Link>
        </Button>
      </div>
    </div>
  );
}
