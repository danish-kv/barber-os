"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Globe, Save, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";

export default function AdminSettingsPage() {
  const [signups, setSignups] = useState(true);
  const [maintenanceBanner, setMaintenanceBanner] = useState(false);
  const [autoSuspend, setAutoSuspend] = useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Platform settings" description="Barbershop OS configuration" />

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Globe className="size-4 text-muted-foreground" aria-hidden />
          Availability
        </h2>
        <div className="mt-4 grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">New shop signups</p>
              <p className="text-xs text-muted-foreground">Allow self-serve registration</p>
            </div>
            <Switch checked={signups} onCheckedChange={setSignups} aria-label="New signups" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Maintenance banner</p>
              <p className="text-xs text-muted-foreground">Show downtime notice to all tenants</p>
            </div>
            <Switch
              checked={maintenanceBanner}
              onCheckedChange={setMaintenanceBanner}
              aria-label="Maintenance banner"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Wallet className="size-4 text-muted-foreground" aria-hidden />
          Billing defaults
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="trial-days">Trial length (days)</Label>
            <Input id="trial-days" type="number" inputMode="numeric" defaultValue={14} className="h-11" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="grace-days">Past-due grace (days)</Label>
            <Input id="grace-days" type="number" inputMode="numeric" defaultValue={7} className="h-11" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div>
            <p className="text-sm font-medium">Auto-suspend after grace</p>
            <p className="text-xs text-muted-foreground">
              Lock tenant access when payment fails past grace period
            </p>
          </div>
          <Switch checked={autoSuspend} onCheckedChange={setAutoSuspend} aria-label="Auto-suspend" />
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
          Data
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo environment — tenants, users and payments are simulated. Tenant
          exports and deletion tooling ship with the production control plane.
        </p>
      </section>

      <Button
        size="lg"
        onClick={() => toast.success("Platform settings saved (simulated)")}
      >
        <Save className="size-4" aria-hidden />
        Save settings
      </Button>
    </div>
  );
}
