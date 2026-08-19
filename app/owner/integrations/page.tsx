"use client";

import { toast } from "sonner";
import {
  Calendar,
  IndianRupee,
  MapPin,
  MessageCircle,
  Share2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const INTEGRATIONS = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: MessageCircle,
    status: "connected",
    description: "Booking confirmations, reminders and campaign messages.",
  },
  {
    id: "upi",
    name: "UPI Payments",
    icon: IndianRupee,
    status: "connected",
    description: "Collect advances and POS payments via any UPI app.",
  },
  {
    id: "gmb",
    name: "Google Business Profile",
    icon: MapPin,
    status: "available",
    description: "Sync hours, photos and 'Book now' link to Google Maps.",
  },
  {
    id: "gcal",
    name: "Google Calendar",
    icon: Calendar,
    status: "available",
    description: "Two-way sync of staff schedules with personal calendars.",
  },
  {
    id: "reviews",
    name: "Review collection",
    icon: Star,
    status: "connected",
    description: "Auto-ask for a rating after each completed visit.",
  },
  {
    id: "referral",
    name: "Referral links",
    icon: Share2,
    status: "available",
    description: "Trackable share links with automatic reward crediting.",
  },
] as const;

export default function OwnerIntegrationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Integrations"
        description="All integrations are simulated in this demo — no external services are called"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((it) => {
          const connected = it.status === "connected";
          return (
            <div key={it.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    connected ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  )}
                >
                  <it.icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{it.name}</p>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      connected ? "text-success" : "text-muted-foreground"
                    )}
                  >
                    {connected ? "● Connected (simulated)" : "Available"}
                  </span>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{it.description}</p>
              <Button
                variant={connected ? "outline" : "default"}
                size="sm"
                className="mt-4 self-start"
                onClick={() =>
                  toast(connected ? "Settings (simulated)" : "Connection flow (simulated)", {
                    description: connected
                      ? `${it.name} configuration would open here.`
                      : `${it.name} OAuth/setup would start here.`,
                  })
                }
              >
                {connected ? "Configure" : "Connect"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
