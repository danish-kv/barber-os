"use client";

import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { customerById } from "@/lib/selectors";
import { MEMBERSHIP_PLANS, SERVICES } from "@/lib/data/seed-static";
import { useNow } from "@/hooks/use-now";
import { dayLabel, inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function OwnerMembershipsPage() {
  const data = useDemoStore((s) => s.data);
  const now = useNow(60000);
  const active = data.memberships.filter((m) => m.status === "active");
  const mrr = active.reduce((s, m) => {
    const plan = MEMBERSHIP_PLANS.find((p) => p.id === m.planId);
    return s + (plan?.pricePerMonth ?? 0);
  }, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Memberships"
        description="Recurring grooming plans keep your best customers monthly"
      />

      <div className="grid grid-cols-3 gap-3">
        <MetricCard compact label="Active members" value={active.length} />
        <MetricCard compact label="Membership MRR" value={mrr} format={(n) => inr(n, { compact: true })} />
        <MetricCard
          compact
          label="Expiring in 7 days"
          value={
            active.filter(
              (m) => new Date(m.renewsAt).getTime() - now.getTime() < 7 * 864e5
            ).length
          }
        />
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        {MEMBERSHIP_PLANS.map((plan) => {
          const members = active.filter((m) => m.planId === plan.id);
          return (
            <div key={plan.id} className="rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <p className="flex items-center gap-1.5 font-heading text-base font-semibold">
                  <Sparkles className="size-4 text-primary" aria-hidden />
                  {plan.name}
                </p>
                <p className="font-heading font-semibold">{inr(plan.pricePerMonth)}/mo</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan.perks.join(" · ")}
              </p>
              <p className="mt-3 border-t pt-3 text-sm">
                <strong>{members.length}</strong>{" "}
                <span className="text-muted-foreground">
                  active member{members.length === 1 ? "" : "s"} ·{" "}
                  {inr(members.length * plan.pricePerMonth, { compact: true })}/mo
                </span>
              </p>
            </div>
          );
        })}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Active members
        </h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {active.map((m) => {
            const customer = customerById(data, m.customerId);
            const plan = MEMBERSHIP_PLANS.find((p) => p.id === m.planId);
            if (!customer || !plan) return null;
            const expiringSoon =
              new Date(m.renewsAt).getTime() - now.getTime() < 7 * 864e5;
            return (
              <li
                key={m.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border bg-card p-3.5",
                  expiringSoon && "border-warning/40"
                )}
              >
                <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{customer.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {plan.name} · renews {dayLabel(m.renewsAt)}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {plan.includedServices
                      .map((inc) => {
                        const svc = SERVICES.find((s) => s.id === inc.serviceId);
                        return `${svc?.name}: ${m.usage[inc.serviceId] ?? 0}/${inc.qty}`;
                      })
                      .join(" · ")}
                  </p>
                </div>
                {expiringSoon && (
                  <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground dark:text-warning">
                    RENEWAL DUE
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
