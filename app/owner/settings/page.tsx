"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, CalendarClock, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { PERMISSIONS } from "@/lib/personas";
import type { Role } from "@/lib/types";

const ROLE_ROWS: Array<{ role: Role; label: string; summary: string }> = [
  { role: "barber", label: "Barber", summary: "Can view own customers and appointments" },
  { role: "receptionist", label: "Reception", summary: "Can manage bookings and payments" },
  { role: "manager", label: "Manager", summary: "Can manage branch operations" },
  { role: "owner", label: "Owner", summary: "Can view all financial and business data" },
];

const PERMISSION_LABELS: Array<{ key: keyof typeof PERMISSIONS.owner; label: string }> = [
  { key: "manageBookings", label: "Bookings" },
  { key: "managePayments", label: "Payments" },
  { key: "manageStaff", label: "Staff" },
  { key: "manageInventory", label: "Inventory" },
  { key: "manageMarketing", label: "Marketing" },
  { key: "viewAllFinancials", label: "Financials" },
  { key: "approveLeave", label: "Approve leave" },
];

export default function OwnerSettingsPage() {
  const [autoReminders, setAutoReminders] = useState(true);
  const [onlineBooking, setOnlineBooking] = useState(true);
  const [advanceRequired, setAdvanceRequired] = useState(false);

  const save = () =>
    toast.success("Settings saved", { description: "Applied to demo state." });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Business configuration" />

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="size-4 text-muted-foreground" aria-hidden />
          Business details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="biz-name">Business name</Label>
            <Input id="biz-name" defaultValue="Royal Cuts" className="h-11" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="biz-phone">Primary phone</Label>
            <Input id="biz-phone" type="tel" defaultValue="+91 9847 12 3401" className="h-11" />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="biz-tagline">Tagline</Label>
            <Input
              id="biz-tagline"
              defaultValue="Kerala's grooming, reimagined"
              className="h-11"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarClock className="size-4 text-muted-foreground" aria-hidden />
          Booking rules
        </h2>
        <div className="mt-4 grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Online booking</p>
              <p className="text-xs text-muted-foreground">
                Customers can book from the public page
              </p>
            </div>
            <Switch checked={onlineBooking} onCheckedChange={setOnlineBooking} aria-label="Online booking" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">WhatsApp reminders</p>
              <p className="text-xs text-muted-foreground">
                Auto-remind customers 1 hour before their slot
              </p>
            </div>
            <Switch checked={autoReminders} onCheckedChange={setAutoReminders} aria-label="WhatsApp reminders" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Require ₹100 advance</p>
              <p className="text-xs text-muted-foreground">
                Reduce no-shows on weekend evening slots
              </p>
            </div>
            <Switch checked={advanceRequired} onCheckedChange={setAdvanceRequired} aria-label="Require advance" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="size-4 text-muted-foreground" aria-hidden />
          Roles & permissions
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th scope="col" className="pb-2 font-medium">Role</th>
                {PERMISSION_LABELS.map((p) => (
                  <th key={p.key} scope="col" className="pb-2 text-center text-xs font-medium">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_ROWS.map((row) => (
                <tr key={row.role} className="border-b last:border-0">
                  <th scope="row" className="py-2.5 text-left">
                    <span className="block font-medium">{row.label}</span>
                    <span className="block text-[11px] font-normal text-muted-foreground">
                      {row.summary}
                    </span>
                  </th>
                  {PERMISSION_LABELS.map((p) => (
                    <td key={p.key} className="py-2.5 text-center">
                      {PERMISSIONS[row.role][p.key] ? (
                        <span className="text-success" aria-label="Allowed">✓</span>
                      ) : (
                        <span className="text-muted-foreground/40" aria-label="Not allowed">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          These permissions gate what each demo persona can see and do across the
          app.
        </p>
      </section>

      <Button size="lg" onClick={save}>
        <Save className="size-4" aria-hidden />
        Save settings
      </Button>
    </div>
  );
}
