"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addDays } from "date-fns";
import { toast } from "sonner";
import { BadgePercent, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { useDemoStore } from "@/lib/store";
import { dayLabel, inr } from "@/lib/format";
import type { OfferAudience } from "@/lib/types";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  { id: "custom", label: "Custom offer", title: "", description: "", discount: 10, audience: "all" as OfferAudience },
  { id: "first", label: "First Visit", title: "First Visit Offer", description: "20% off your first service with us.", discount: 20, audience: "new" as OfferAudience },
  { id: "birthday", label: "Birthday", title: "Birthday Treat", description: "Free head massage with any service in your birthday month.", discount: 0, audience: "birthday" as OfferAudience },
  { id: "onam", label: "Onam", title: "Onam Special", description: "Festive grooming combo at a special price.", discount: 12, audience: "all" as OfferAudience },
  { id: "eid", label: "Eid", title: "Eid Mubarak Offer", description: "Look sharp for Eid — 15% off combos.", discount: 15, audience: "all" as OfferAudience },
  { id: "vishu", label: "Vishu", title: "Vishu Fresh Start", description: "New year, new look — 15% off.", discount: 15, audience: "all" as OfferAudience },
  { id: "student", label: "Student", title: "Student Offer", description: "15% off with valid student ID.", discount: 15, audience: "all" as OfferAudience },
  { id: "referral", label: "Referral", title: "Refer a Friend", description: "₹100 off for you and your friend.", discount: 0, audience: "repeat" as OfferAudience },
  { id: "winback", label: "Win Back", title: "We Miss You", description: "₹100 off — it's been a while!", discount: 0, audience: "inactive-60" as OfferAudience },
  { id: "offpeak", label: "Off-Peak", title: "Off-Peak Discount", description: "20% off Tuesday–Thursday mornings.", discount: 20, audience: "all" as OfferAudience },
];

const AUDIENCE_LABEL: Record<OfferAudience, string> = {
  new: "New customers",
  repeat: "Repeat customers",
  vip: "VIP",
  "inactive-30": "Inactive 30 days",
  "inactive-60": "Inactive 60 days",
  birthday: "Birthday this month",
  "membership-expiring": "Membership expiring",
  "high-spender": "High spenders",
  all: "Everyone",
};

function OffersInner() {
  const searchParams = useSearchParams();
  const data = useDemoStore((s) => s.data);
  const createOffer = useDemoStore((s) => s.createOffer);
  const toggleOffer = useDemoStore((s) => s.toggleOffer);

  const [open, setOpen] = useState(searchParams.get("new") === "1");
  const [templateId, setTemplateId] = useState("custom");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState(10);
  const [audience, setAudience] = useState<OfferAudience>("all");

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const t = TEMPLATES.find((x) => x.id === id)!;
    if (id !== "custom") {
      setTitle(t.title);
      setDescription(t.description);
      setDiscount(t.discount);
      setAudience(t.audience);
    }
  };

  const submit = () => {
    if (!title.trim()) {
      toast.error("Give the offer a title");
      return;
    }
    createOffer({
      branchId: "all",
      title: title.trim(),
      description: description.trim(),
      discountPercent: discount || undefined,
      validFrom: new Date().toISOString(),
      validTo: addDays(new Date(), 30).toISOString(),
      audience,
      active: true,
      code: title.replace(/[^A-Za-z]/g, "").slice(0, 8).toUpperCase() || "OFFER",
    });
    toast.success("Offer created", { description: "Now live for customers." });
    setOpen(false);
    setTitle("");
    setDescription("");
  };

  const offers = [...data.offers].sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Offers"
        description="Live offers appear in the customer app instantly"
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New offer
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={cn(
              "rounded-2xl border bg-card p-4 shadow-xs",
              !offer.active && "opacity-60"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <BadgePercent className="size-4 text-primary" aria-hidden />
                  {offer.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{offer.description}</p>
              </div>
              <Switch
                checked={offer.active}
                onCheckedChange={() => {
                  toggleOffer(offer.id);
                  toast(offer.active ? "Offer paused" : "Offer activated");
                }}
                aria-label={`Toggle ${offer.title}`}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
              <span className="font-mono font-semibold text-primary">{offer.code}</span>
              <span>
                {offer.offerPrice
                  ? `${inr(offer.originalPrice ?? 0)} → ${inr(offer.offerPrice)}`
                  : offer.discountPercent
                    ? `${offer.discountPercent}% off`
                    : "Special"}
              </span>
              <span>{AUDIENCE_LABEL[offer.audience]}</span>
              <span>till {dayLabel(offer.validTo)}</span>
              <span className="ml-auto font-medium text-foreground">
                {offer.redemptions} redemptions
              </span>
            </div>
          </div>
        ))}
      </div>

      <BottomSheet open={open} onOpenChange={setOpen} title="Create offer" contentClassName="sm:max-w-lg">
        <div className="grid gap-4 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                aria-pressed={templateId === t.id}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  templateId === t.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="offer-title">Title</Label>
            <Input
              id="offer-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Monday Grooming"
              className="h-11"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="offer-desc">Description</Label>
            <Input
              id="offer-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Haircut ₹250 → ₹199, Mondays 10 AM–2 PM"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="offer-discount">Discount %</Label>
              <Input
                id="offer-discount"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as OfferAudience)}>
                <SelectTrigger className="h-11" aria-label="Audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AUDIENCE_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="lg" onClick={submit}>
            Create offer
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

export default function OwnerOffersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <OffersInner />
    </Suspense>
  );
}
