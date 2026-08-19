"use client";

import Link from "next/link";
import { subMonths, format } from "date-fns";
import { Check, CreditCard, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SUBSCRIPTION_PLANS } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const CURRENT_PLAN_ID = "business";

export default function OwnerBillingPage() {
  const current = SUBSCRIPTION_PLANS.find((p) => p.id === CURRENT_PLAN_ID)!;
  const invoices = Array.from({ length: 4 }, (_, i) => ({
    id: `SUB-${2026 - 0}${String(8 - i).padStart(2, "0")}`,
    date: subMonths(new Date(), i),
    amount: current.pricePerMonth,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Billing" description="Your Barbershop OS subscription" />

      {/* Current plan */}
      <section className="rounded-2xl border border-primary bg-card p-5 shadow-md shadow-primary/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Current plan
            </p>
            <p className="mt-1 font-heading text-2xl font-semibold">{current.name}</p>
            <p className="text-sm text-muted-foreground">
              {inr(current.pricePerMonth)}/month · renews 1{" "}
              {format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), "MMM")}
            </p>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            ACTIVE
          </span>
        </div>
        <ul className="mt-4 grid gap-1.5 border-t pt-4 sm:grid-cols-2">
          {current.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="size-3.5 text-success" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <CreditCard className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">
            Paying via UPI autopay · royal.cuts@ybl (simulated)
          </span>
        </div>
      </section>

      {/* Upgrade */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Change plan
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = plan.id === CURRENT_PLAN_ID;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-4",
                  isCurrent && "border-primary"
                )}
              >
                <p className="text-sm font-semibold">{plan.name}</p>
                <p className="mt-1 font-heading text-xl font-semibold">
                  {inr(plan.pricePerMonth)}
                  {plan.priceSuffix ?? ""}
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
                <Button
                  variant={isCurrent ? "outline" : "default"}
                  size="sm"
                  className="mt-3"
                  disabled={isCurrent}
                  onClick={() =>
                    toast.success(`Plan change to ${plan.name} requested (simulated)`)
                  }
                >
                  {isCurrent ? "Current" : plan.pricePerMonth > 1499 ? "Upgrade" : "Switch"}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Compare all plans on the{" "}
          <Link href="/pricing" className="font-medium text-primary hover:underline">
            pricing page
          </Link>
          .
        </p>
      </section>

      {/* Invoices */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Payment history
        </h2>
        <ul className="overflow-hidden rounded-2xl border bg-card">
          {invoices.map((inv, i) => (
            <li
              key={inv.id}
              className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t")}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{inv.id}</p>
                <p className="text-xs text-muted-foreground">
                  {format(inv.date, "d MMM yyyy")} · Business plan
                </p>
              </div>
              <span className="font-medium tabular-nums">{inr(inv.amount)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Download ${inv.id}`}
                onClick={() => toast.success("Invoice downloaded (simulated)")}
              >
                <Download className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
