"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, ChevronRight, Languages, Scissors, Shield, UserRound } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useDemoStore } from "@/lib/store";
import { customerStats } from "@/lib/selectors";
import { inr } from "@/lib/format";

const CUSTOMER_ID = "cu_danish";

export default function CustomerProfilePage() {
  const data = useDemoStore((s) => s.data);
  const stats = customerStats(data, CUSTOMER_ID);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);

  if (!stats) return null;
  const { customer } = stats;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>

      <section className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="xl" />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold">{customer.name}</p>
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
          <p className="text-xs text-muted-foreground">{customer.email}</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Visits", value: String(stats.visits) },
          { label: "Spent", value: inr(stats.lifetimeSpend, { compact: true }) },
          { label: "Member since", value: new Date(customer.joinedAt).getFullYear().toString() },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-3">
            <p className="font-heading text-lg font-semibold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-card">
        <div className="flex items-center gap-3 p-4">
          <Languages className="size-4.5 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">Language</p>
            <p className="text-xs text-muted-foreground">Booking & confirmations</p>
          </div>
          <LanguageToggle />
        </div>
        <Separator />
        <div className="flex items-center gap-3 p-4">
          <Bell className="size-4.5 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">WhatsApp updates</p>
            <p className="text-xs text-muted-foreground">Booking confirmations & offers</p>
          </div>
          <Switch checked={notifWhatsapp} onCheckedChange={setNotifWhatsapp} aria-label="WhatsApp updates" />
        </div>
        <Separator />
        <div className="flex items-center gap-3 p-4">
          <Bell className="size-4.5 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">Appointment reminders</p>
            <p className="text-xs text-muted-foreground">1 hour before your slot</p>
          </div>
          <Switch checked={notifReminders} onCheckedChange={setNotifReminders} aria-label="Appointment reminders" />
        </div>
      </section>

      <section className="rounded-2xl border bg-card">
        {[
          { icon: Scissors, label: "My preferences", hint: customer.preferences.join(", ") || "None set" },
          { icon: UserRound, label: "Preferred barber", hint: "Akhil" },
          { icon: Shield, label: "Privacy & data", hint: "Demo environment" },
        ].map((row, i) => (
          <div key={row.label}>
            {i > 0 && <Separator />}
            <button
              className="flex w-full items-center gap-3 p-4 text-left"
              onClick={() => toast("Demo", { description: `${row.label} — editable in the full product.` })}
            >
              <row.icon className="size-4.5 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="truncate text-xs text-muted-foreground">{row.hint}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
