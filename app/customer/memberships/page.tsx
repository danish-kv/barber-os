"use client";

import { toast } from "sonner";
import { Check, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDemoStore } from "@/lib/store";
import { MEMBERSHIP_PLANS, SERVICES } from "@/lib/data/seed-static";
import { dayLabel, inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const CUSTOMER_ID = "cu_danish";

export default function CustomerMembershipsPage() {
  const data = useDemoStore((s) => s.data);
  const membership = data.memberships.find(
    (m) => m.customerId === CUSTOMER_ID && m.status === "active"
  );
  const activePlan = membership
    ? MEMBERSHIP_PLANS.find((p) => p.id === membership.planId)
    : undefined;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Membership</h1>

      {/* Active card */}
      {membership && activePlan ? (
        <section
          aria-label="Active membership"
          className="relative overflow-hidden rounded-3xl bg-sidebar p-6 text-sidebar-foreground shadow-lg"
        >
          <div
            aria-hidden
            className="absolute -right-8 -bottom-12 size-44 rounded-full bg-sidebar-primary/10"
          />
          <div className="flex items-start justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-sidebar-primary uppercase">
                <Crown className="size-3.5" aria-hidden />
                {activePlan.name}
              </p>
              <p className="mt-1 font-heading text-2xl font-semibold text-sidebar-accent-foreground">
                Danish
              </p>
            </div>
            <span className="rounded-full bg-success/20 px-2.5 py-1 text-[11px] font-semibold text-success">
              ACTIVE
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            {activePlan.includedServices.map((inc) => {
              const svc = SERVICES.find((s) => s.id === inc.serviceId);
              const used = membership.usage[inc.serviceId] ?? 0;
              return (
                <div key={inc.serviceId}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-sidebar-foreground/90">{svc?.name}</span>
                    <span className="font-medium text-sidebar-accent-foreground tabular-nums">
                      {used} / {inc.qty} used
                    </span>
                  </div>
                  <Progress
                    value={(used / inc.qty) * 100}
                    className="mt-1 h-1.5 bg-sidebar-accent"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-sidebar-border pt-4 text-xs text-sidebar-foreground/70">
            <span>Renews {dayLabel(membership.renewsAt)} · {inr(activePlan.pricePerMonth)}/month</span>
            <button
              className="font-medium text-sidebar-primary hover:underline"
              onClick={() =>
                toast("Membership management", {
                  description: "Pause or cancel from the shop counter (demo).",
                })
              }
            >
              Manage
            </button>
          </div>
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">
          You don&apos;t have an active membership yet — pick a plan below.
        </p>
      )}

      {/* Plans */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {membership ? "Upgrade options" : "Choose a plan"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MEMBERSHIP_PLANS.map((plan) => {
            const isCurrent = plan.id === membership?.planId;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-5 shadow-xs",
                  isCurrent && "border-primary"
                )}
              >
                <p className="flex items-center gap-1.5 font-heading text-base font-semibold">
                  <Sparkles className="size-4 text-primary" aria-hidden />
                  {plan.name}
                </p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-semibold">
                    {inr(plan.pricePerMonth)}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </p>
                <ul className="mt-3 grid flex-1 gap-1.5">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  onClick={() =>
                    toast.success("Membership request sent (simulated)", {
                      description: "Reception will confirm and activate it at your next visit.",
                    })
                  }
                >
                  {isCurrent ? "Current plan" : "Get this plan"}
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
