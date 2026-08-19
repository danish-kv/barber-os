"use client";

// "How does your shop take bookings?" — plain-language operating modes
// (Demo V1.1 §25). Every change applies immediately to the public page,
// booking flow and queue: config drives behavior, there is no fake toggle.

import { toast } from "sonner";
import {
  CalendarCheck,
  Footprints,
  Inbox,
  PhoneCall,
  Zap,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useDemoStore } from "@/lib/store";
import { ALL_BUSINESSES } from "@/lib/data/seed-static";
import type { AdvancePolicy, BookingMode, StaffSelectionPolicy } from "@/lib/types";
import { cn } from "@/lib/utils";

const BOOKING_MODES: Array<{
  id: BookingMode;
  label: string;
  desc: string;
  icon: typeof Zap;
}> = [
  {
    id: "online_instant",
    label: "Online booking — instant confirm",
    desc: "Customers pick a slot on your public page and it books itself.",
    icon: Zap,
  },
  {
    id: "online_request",
    label: "Online booking — requests",
    desc: "Customers send a request; you accept, suggest a time, or decline.",
    icon: Inbox,
  },
  {
    id: "staff_only",
    label: "I take bookings myself",
    desc: "Phone / WhatsApp / in person. Your page shows Call & WhatsApp buttons.",
    icon: PhoneCall,
  },
  {
    id: "walk_in_only",
    label: "Walk-in only",
    desc: "No appointments — your page shows live wait time instead.",
    icon: Footprints,
  },
];

const STAFF_POLICIES: Array<{
  id: StaffSelectionPolicy;
  label: string;
  desc: string;
}> = [
  {
    id: "customer",
    label: "Customer chooses barber",
    desc: "Booking flow shows your staff and their ratings.",
  },
  {
    id: "any",
    label: "Any available barber",
    desc: "Fastest slot wins; you can reassign at the chair.",
  },
  {
    id: "shop",
    label: "Shop assigns",
    desc: "Staff names stay private — customers just pick a time.",
  },
];

const ADVANCE_POLICIES: Array<{ id: AdvancePolicy; label: string }> = [
  { id: "none", label: "No advance" },
  { id: "optional", label: "Optional advance" },
  { id: "required", label: "Advance required" },
];

export default function ShopSettingsPage() {
  const data = useDemoStore((s) => s.data);
  const updateConfig = useDemoStore((s) => s.updateConfig);
  const config = data.config;
  const business = ALL_BUSINESSES.find((b) => b.id === data.businessId);

  const modeLabel = BOOKING_MODES.find((m) => m.id === config.bookingMode)?.label;
  const staffLabel = STAFF_POLICIES.find((p) => p.id === config.staffSelection)?.label;
  const advanceLabel = ADVANCE_POLICIES.find((a) => a.id === config.advance)?.label;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Changes apply instantly to your public page and booking flow.
        </p>
      </div>

      {/* §51 summary card */}
      <section className="rounded-2xl border bg-sidebar p-4 text-sidebar-foreground">
        <h2 className="text-[11px] font-semibold tracking-widest uppercase opacity-70">
          How this shop operates
        </h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <CalendarCheck className="size-3.5 shrink-0 opacity-70" aria-hidden />
            {modeLabel}
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block size-3.5 shrink-0" />
            {staffLabel} · {advanceLabel}
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block size-3.5 shrink-0" />
            {config.ownerWorksAsStaff
              ? "Owner takes customers"
              : "Owner manages only"}
            {config.bookingMode === "walk_in_only" &&
              (config.remoteQueueJoin
                ? " · customers can join the queue online"
                : " · queue joined at the shop")}
          </li>
        </ul>
      </section>

      {/* Booking mode */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          How do you take bookings?
        </h2>
        <div className="grid gap-1.5" role="radiogroup" aria-label="Booking mode">
          {BOOKING_MODES.map((m) => {
            const active = config.bookingMode === m.id;
            return (
              <button
                key={m.id}
                role="radio"
                aria-checked={active}
                onClick={() => {
                  if (active) return;
                  updateConfig({ bookingMode: m.id });
                  toast.success(m.label, {
                    description: "Public page updated.",
                  });
                }}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border bg-card p-3.5 text-left transition-colors",
                  active && "border-primary bg-primary/5 ring-1 ring-primary"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    active ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <m.icon
                    className={cn(
                      "size-4",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                    aria-hidden
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">{m.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        {config.bookingMode === "walk_in_only" && (
          <div className="mt-2 flex items-center justify-between rounded-xl border bg-card p-3.5">
            <div className="min-w-0 pr-3">
              <p className="text-sm font-medium">Let customers join the queue online</p>
              <p className="text-xs text-muted-foreground">
                Public page shows live wait + a &ldquo;join queue&rdquo; button.
              </p>
            </div>
            <Switch
              checked={config.remoteQueueJoin}
              onCheckedChange={(v) => updateConfig({ remoteQueueJoin: v })}
              aria-label="Remote queue join"
            />
          </div>
        )}
      </section>

      {/* Staff selection */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Who picks the barber?
        </h2>
        <div className="grid gap-1.5" role="radiogroup" aria-label="Staff selection">
          {STAFF_POLICIES.map((p) => {
            const active = config.staffSelection === p.id;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={active}
                onClick={() => updateConfig({ staffSelection: p.id })}
                className={cn(
                  "rounded-2xl border bg-card p-3.5 text-left transition-colors",
                  active && "border-primary bg-primary/5 ring-1 ring-primary"
                )}
              >
                <span className="block text-sm font-semibold">{p.label}</span>
                <span className="block text-xs text-muted-foreground">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Advance */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Advance payment
        </h2>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Advance policy">
          {ADVANCE_POLICIES.map((a) => {
            const active = config.advance === a.id;
            return (
              <button
                key={a.id}
                role="radio"
                aria-checked={active}
                onClick={() => updateConfig({ advance: a.id })}
                className={cn(
                  "min-h-11 rounded-xl border bg-card px-2 text-xs font-medium",
                  active && "border-primary bg-primary text-primary-foreground"
                )}
              >
                {a.label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Demo note: advance collection is simulated — no real payments.
        </p>
      </section>

      {/* Owner works as staff */}
      <section className="flex items-center justify-between rounded-2xl border bg-card p-4">
        <div className="min-w-0 pr-3">
          <p className="text-sm font-semibold">I also take customers</p>
          <p className="text-xs text-muted-foreground">
            You appear in the schedule and availability as a barber.
          </p>
        </div>
        <Switch
          checked={config.ownerWorksAsStaff}
          onCheckedChange={(v) => updateConfig({ ownerWorksAsStaff: v })}
          aria-label="Owner works as staff"
        />
      </section>

      <p className="text-center text-[11px] text-muted-foreground">
        Public page: /shops/{business?.slug}
      </p>
    </div>
  );
}
