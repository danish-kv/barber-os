"use client";

import Link from "next/link";
import { BadgePercent, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { dayLabel, inr } from "@/lib/format";

export default function CustomerOffersPage() {
  const offers = useDemoStore((s) => s.data.offers).filter((o) => o.active);

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Offers</h1>

      {offers.length === 0 ? (
        <EmptyState
          icon={BadgePercent}
          title="No active offers"
          description="Check back soon — new offers drop every festival season."
        />
      ) : (
        <div className="grid gap-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="overflow-hidden rounded-2xl border bg-card shadow-xs"
            >
              <div className="bg-linear-to-r from-accent/70 to-accent/20 px-5 py-4">
                <p className="font-heading text-lg font-semibold">{offer.title}</p>
                <p className="text-sm font-medium text-primary">
                  {offer.offerPrice
                    ? `${inr(offer.originalPrice ?? 0)} → ${inr(offer.offerPrice)}`
                    : offer.discountPercent
                      ? `${offer.discountPercent}% off`
                      : "Special offer"}
                  {offer.windowLabel ? ` · ${offer.windowLabel}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">{offer.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Valid till {dayLabel(offer.validTo)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(offer.code);
                      toast.success(`Code ${offer.code} copied`);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-dashed border-primary/50 bg-primary/5 px-2.5 py-1 font-mono text-xs font-semibold text-primary"
                  >
                    {offer.code}
                    <Copy className="size-3" aria-hidden />
                  </button>
                  <Button size="sm" asChild>
                    <Link href="/shops/royal-cuts/book">Book now</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
