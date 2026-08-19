"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Megaphone, MessageCircle, Plus, Send, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { useDemoStore } from "@/lib/store";
import { customerSegments } from "@/lib/selectors";
import { inr, relativeTime } from "@/lib/format";
import type { CampaignChannel, OfferAudience } from "@/lib/types";
import { cn } from "@/lib/utils";

const AUDIENCES: Array<{ id: OfferAudience; label: string }> = [
  { id: "new", label: "New customers" },
  { id: "repeat", label: "Repeat customers" },
  { id: "vip", label: "VIP" },
  { id: "inactive-30", label: "Inactive 30 days" },
  { id: "inactive-60", label: "Inactive 60 days" },
  { id: "birthday", label: "Birthday this month" },
  { id: "membership-expiring", label: "Membership expiring" },
  { id: "high-spender", label: "High spenders" },
];

const CHANNELS: Array<{ id: CampaignChannel; label: string; icon: typeof Send; note?: string }> = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "sms", label: "SMS", icon: Smartphone, note: "placeholder" },
  { id: "push", label: "Push", icon: Send, note: "placeholder" },
];

export default function OwnerMarketingPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const createCampaign = useDemoStore((s) => s.createCampaign);
  const sendCampaign = useDemoStore((s) => s.sendCampaign);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<CampaignChannel>("whatsapp");
  const [audience, setAudience] = useState<OfferAudience>("inactive-60");
  const [message, setMessage] = useState(
    "Hi {name}! It's been a while since your last visit to Royal Cuts. Here's ₹100 off your next service — show code COMEBACK100. Book: royalcuts.in/book"
  );

  const segments = useMemo(
    () => customerSegments(data, branchFilter),
    [data, branchFilter]
  );

  const audienceCount = (a: OfferAudience) => {
    switch (a) {
      case "new":
        return segments.newCustomers.length;
      case "repeat":
        return segments.returning.length;
      case "vip":
        return segments.vip.length;
      case "inactive-30":
        return segments.inactive30.length;
      case "inactive-60":
        return segments.inactive60.length;
      case "birthday":
        return 23; // simulated
      case "membership-expiring":
        return data.memberships.filter(
          (m) => m.status === "active" && new Date(m.renewsAt).getTime() - Date.now() < 7 * 864e5
        ).length;
      case "high-spender":
        return segments.all.filter((s) => s.lifetimeSpend > 4000).length;
      default:
        return segments.all.length;
    }
  };

  const count = audienceCount(audience);
  const estCost = channel === "whatsapp" ? Math.round(count * 0.75) : channel === "sms" ? Math.round(count * 0.5) : 0;
  const estRevenue = Math.round(count * 0.2 * 700);

  const submit = () => {
    if (!name.trim()) {
      toast.error("Give the campaign a name");
      return;
    }
    createCampaign({
      name: name.trim(),
      channel,
      audience,
      audienceCount: count,
      message,
      estimatedCost: estCost,
      estimatedRevenue: estRevenue,
    });
    toast.success("Campaign drafted", {
      description: "Review and send it from the list.",
    });
    setOpen(false);
    setName("");
  };

  const campaigns = [...data.campaigns].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Marketing"
        description="Segmented campaigns with estimated ROI — sends are simulated in the demo"
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New campaign
          </Button>
        }
      />

      {/* Segment overview */}
      <section className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0">
        {AUDIENCES.slice(0, 8).map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setAudience(a.id);
              setOpen(true);
            }}
            className="min-w-36 shrink-0 rounded-2xl border bg-card p-3.5 text-left transition-shadow hover:shadow-md"
          >
            <p className="font-heading text-xl font-semibold tabular-nums">
              {audienceCount(a.id)}
            </p>
            <p className="text-xs text-muted-foreground">{a.label}</p>
          </button>
        ))}
      </section>

      {/* Campaigns */}
      <section className="grid gap-3">
        {campaigns.map((c) => (
          <div key={c.id} className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Megaphone className="size-4 text-primary" aria-hidden />
                  {c.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.channel.toUpperCase()} ·{" "}
                  {AUDIENCES.find((a) => a.id === c.audience)?.label ?? "Everyone"} ·{" "}
                  {c.audienceCount} recipients
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
                  c.status === "sent" && "bg-success/10 text-success",
                  c.status === "scheduled" && "bg-info/10 text-info",
                  c.status === "draft" && "bg-muted text-muted-foreground"
                )}
              >
                {c.status}
              </span>
            </div>

            {/* WhatsApp-style message preview */}
            <div className="mt-3 rounded-xl rounded-tl-sm bg-muted/60 p-3 text-sm">
              {c.message}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                Est. cost <strong className="text-foreground">{inr(c.estimatedCost)}</strong>
              </span>
              <span>
                Potential revenue{" "}
                <strong className="text-success">{inr(c.estimatedRevenue)}</strong>{" "}
                <span className="text-[10px]">(if 20% return · simulated)</span>
              </span>
              <span className="ml-auto">
                {c.status === "sent" && c.sentAt
                  ? `Sent ${relativeTime(c.sentAt)}`
                  : `Created ${relativeTime(c.createdAt)}`}
              </span>
              {c.status !== "sent" && (
                <Button
                  size="sm"
                  onClick={() => {
                    sendCampaign(c.id);
                    toast.success("Campaign sent (simulated)", {
                      description: `${c.audienceCount} messages queued — no real messages were sent.`,
                    });
                  }}
                >
                  <Send className="size-3.5" aria-hidden />
                  Send now
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Create sheet */}
      <BottomSheet open={open} onOpenChange={setOpen} title="New campaign" contentClassName="sm:max-w-lg">
        <div className="grid gap-4 pb-4">
          <div className="grid gap-1.5">
            <Label htmlFor="cp-name">Campaign name</Label>
            <Input
              id="cp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="We Miss You — September"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setChannel(ch.id)}
                aria-pressed={channel === ch.id}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium",
                  channel === ch.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "bg-card hover:bg-muted"
                )}
              >
                <ch.icon className="size-4.5" aria-hidden />
                {ch.label}
                {ch.note && <span className="text-[9px] opacity-70">{ch.note}</span>}
              </button>
            ))}
          </div>
          <div className="grid gap-1.5">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={(v) => setAudience(v as OfferAudience)}>
              <SelectTrigger className="h-11" aria-label="Audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label} ({audienceCount(a.id)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cp-message">Message</Label>
            <Textarea
              id="cp-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-[11px] text-muted-foreground">
              {"{name}"} personalizes each message.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-3 text-center text-xs">
            <div>
              <p className="font-heading text-base font-semibold tabular-nums">{count}</p>
              <p className="text-muted-foreground">Reach</p>
            </div>
            <div>
              <p className="font-heading text-base font-semibold tabular-nums">{inr(estCost)}</p>
              <p className="text-muted-foreground">Est. cost</p>
            </div>
            <div>
              <p className="font-heading text-base font-semibold text-success tabular-nums">
                {inr(estRevenue)}
              </p>
              <p className="text-muted-foreground">Potential</p>
            </div>
          </div>
          <Button size="lg" onClick={submit}>
            Create draft
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
