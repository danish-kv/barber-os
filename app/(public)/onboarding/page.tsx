"use client";

// 9-step shop onboarding wizard. State is local — completing it routes into
// the owner demo so the "under an hour" setup story lands.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  Clock,
  CreditCard,
  MapPin,
  Palette,
  Rocket,
  Scissors,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useDemoStore } from "@/lib/store";
import { SERVICES } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Business", icon: Building2 },
  { title: "Branch", icon: MapPin },
  { title: "Hours", icon: Clock },
  { title: "Services", icon: Scissors },
  { title: "Staff", icon: Users },
  { title: "Payments", icon: CreditCard },
  { title: "Booking rules", icon: CalendarClock },
  { title: "Branding", icon: Palette },
  { title: "Launch", icon: Rocket },
] as const;

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function OnboardingPage() {
  const router = useRouter();
  const enterRole = useDemoStore((s) => s.enterRole);
  const [step, setStep] = useState(0);

  // form state
  const [bizName, setBizName] = useState("");
  const [city, setCity] = useState("Kochi");
  const [locality, setLocality] = useState("");
  const [openTime, setOpenTime] = useState("10:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [closedDays, setClosedDays] = useState<number[]>([]);
  const [pickedServices, setPickedServices] = useState<string[]>([
    "sv_haircut",
    "sv_beardtrim",
    "sv_haircutbeard",
  ]);
  const [staffNames, setStaffNames] = useState<string[]>([""]);
  const [upi, setUpi] = useState(true);
  const [cash, setCash] = useState(true);
  const [card, setCard] = useState(false);
  const [advance, setAdvance] = useState(true);
  const [walkIns, setWalkIns] = useState(true);
  const [tone, setTone] = useState<"charcoal" | "emerald" | "clay">("charcoal");

  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = (() => {
    switch (step) {
      case 0:
        return bizName.trim().length > 1;
      case 1:
        return locality.trim().length > 1;
      case 3:
        return pickedServices.length > 0;
      case 4:
        return staffNames.some((n) => n.trim().length > 1);
      default:
        return true;
    }
  })();

  const next = () => {
    if (step === STEPS.length - 1) {
      enterRole("owner");
      toast.success(`${bizName || "Your shop"} is live! (simulated)`, {
        description: "Entering the owner dashboard with demo data.",
      });
      router.push("/owner");
      return;
    }
    setStep((s) => s + 1);
  };

  const StepIcon = STEPS[step].icon;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <StepIcon className="size-4 text-primary" aria-hidden />
            {STEPS[step].title}
          </span>
          <span className="tabular-nums">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="mt-2 h-1.5" />
      </div>

      <div className="min-h-80">
        {step === 0 && (
          <div className="grid gap-4">
            <h1 className="font-heading text-2xl font-semibold">
              What&apos;s your shop called?
            </h1>
            <div className="grid gap-1.5">
              <Label htmlFor="ob-name">Business name</Label>
              <Input
                id="ob-name"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="Royal Cuts"
                className="h-12 text-lg"
                autoFocus
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ob-phone">Business phone</Label>
              <Input
                id="ob-phone"
                type="tel"
                inputMode="tel"
                placeholder="+91 98470 00000"
                className="h-12"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <h1 className="font-heading text-2xl font-semibold">
              Where is your first branch?
            </h1>
            <div className="grid gap-1.5">
              <Label htmlFor="ob-locality">Area / locality</Label>
              <Input
                id="ob-locality"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Kakkanad"
                className="h-12"
                autoFocus
              />
            </div>
            <div className="grid gap-1.5">
              <Label>City</Label>
              <div className="flex flex-wrap gap-1.5">
                {["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam"].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => setCity(c)}
                      aria-pressed={city === c}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-sm font-medium",
                        city === c
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-card hover:bg-muted"
                      )}
                    >
                      {c}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <h1 className="font-heading text-2xl font-semibold">Working hours</h1>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="ob-open">Opens</Label>
                <Input
                  id="ob-open"
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ob-close">Closes</Label>
                <Input
                  id="ob-close"
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Closed days (tap to toggle)</Label>
              <div className="flex gap-1.5">
                {DOW.map((d, i) => {
                  const closed = closedDays.includes(i);
                  return (
                    <button
                      key={d}
                      onClick={() =>
                        setClosedDays((prev) =>
                          closed ? prev.filter((x) => x !== i) : [...prev, i]
                        )
                      }
                      aria-pressed={closed}
                      className={cn(
                        "flex-1 rounded-xl border py-2.5 text-xs font-medium",
                        closed
                          ? "border-destructive/40 bg-destructive/10 text-destructive line-through"
                          : "bg-card"
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            <h1 className="font-heading text-2xl font-semibold">
              Pick your starting services
            </h1>
            <p className="-mt-2 text-sm text-muted-foreground">
              Prices and durations are editable later.
            </p>
            <div className="grid gap-2">
              {SERVICES.map((svc) => {
                const active = pickedServices.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    onClick={() =>
                      setPickedServices((prev) =>
                        active ? prev.filter((x) => x !== svc.id) : [...prev, svc.id]
                      )
                    }
                    aria-pressed={active}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border bg-card p-3.5 text-left",
                      active && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full border",
                        active && "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {active && <Check className="size-3.5" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium">{svc.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {inr(svc.price)} · {svc.durationMin}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4">
            <h1 className="font-heading text-2xl font-semibold">Add your team</h1>
            <div className="grid gap-2">
              {staffNames.map((name, i) => (
                <Input
                  key={i}
                  value={name}
                  onChange={(e) =>
                    setStaffNames((prev) =>
                      prev.map((n, j) => (j === i ? e.target.value : n))
                    )
                  }
                  placeholder={i === 0 ? "Akhil (Senior Barber)" : "Another barber…"}
                  className="h-12"
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() => setStaffNames((prev) => [...prev, ""])}
            >
              + Add another
            </Button>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-4">
            <h1 className="font-heading text-2xl font-semibold">How will you get paid?</h1>
            {(
              [
                ["UPI", upi, setUpi, "GPay, PhonePe, Paytm — settlement to your bank"],
                ["Cash", cash, setCash, "Tracked in the register with daily closing"],
                ["Card", card, setCard, "Requires a card terminal"],
              ] as const
            ).map(([label, value, setter, hint]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border bg-card p-4"
              >
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <Switch checked={value} onCheckedChange={setter} aria-label={label} />
              </div>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="grid gap-4">
            <h1 className="font-heading text-2xl font-semibold">Booking rules</h1>
            <div className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <p className="text-sm font-medium">₹100 advance on online bookings</p>
                <p className="text-xs text-muted-foreground">
                  Cuts no-shows dramatically on busy slots
                </p>
              </div>
              <Switch checked={advance} onCheckedChange={setAdvance} aria-label="Advance" />
            </div>
            <div className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <p className="text-sm font-medium">Walk-in queue</p>
                <p className="text-xs text-muted-foreground">
                  Walk-ins and bookings share one live timeline
                </p>
              </div>
              <Switch checked={walkIns} onCheckedChange={setWalkIns} aria-label="Walk-ins" />
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="grid gap-4">
            <h1 className="font-heading text-2xl font-semibold">Pick your look</h1>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["charcoal", "Charcoal & Gold", "bg-stone-900"],
                  ["emerald", "Deep Emerald", "bg-emerald-900"],
                  ["clay", "Warm Clay", "bg-orange-900"],
                ] as const
              ).map(([id, label, swatch]) => (
                <button
                  key={id}
                  onClick={() => setTone(id)}
                  aria-pressed={tone === id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border bg-card p-4",
                    tone === id && "border-primary ring-1 ring-primary"
                  )}
                >
                  <span className={cn("size-10 rounded-full", swatch)} aria-hidden />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Your public booking page and receipts use this identity.
            </p>
          </div>
        )}

        {step === 8 && (
          <div className="flex flex-col items-center gap-4 pt-6 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-success/10">
              <Rocket className="size-10 text-success" aria-hidden />
            </span>
            <h1 className="font-heading text-2xl font-semibold">
              {bizName || "Your shop"} is ready to launch
            </h1>
            <div className="grid w-full gap-1.5 rounded-2xl border bg-card p-4 text-left text-sm">
              <p>
                <strong>{locality || "Your branch"}, {city}</strong> · {openTime}–{closeTime}
              </p>
              <p className="text-muted-foreground">
                {pickedServices.length} services · {staffNames.filter((n) => n.trim()).length}{" "}
                staff · {[upi && "UPI", cash && "Cash", card && "Card"].filter(Boolean).join(", ")}
              </p>
              <p className="text-muted-foreground">
                {advance ? "₹100 advance on" : "No advance for"} online bookings ·
                walk-in queue {walkIns ? "on" : "off"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Launching drops you into the owner dashboard with demo data.
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>
        <Button size="lg" className="h-12 px-8" disabled={!canNext} onClick={next}>
          {step === STEPS.length - 1 ? "Launch shop" : "Continue"}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
