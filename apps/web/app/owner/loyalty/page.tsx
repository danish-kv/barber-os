"use client";

import { Gift } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { customerById } from "@/lib/selectors";
import { inr } from "@/lib/format";

export default function OwnerLoyaltyPage() {
  const data = useDemoStore((s) => s.data);
  const accounts = data.loyaltyAccounts;
  const totalPoints = accounts.reduce((s, a) => s + a.points, 0);
  const liability = Math.floor(totalPoints / 100) * 100;
  const top = [...accounts].sort((a, b) => b.points - a.points).slice(0, 10);

  const redemptions = data.loyaltyTransactions.filter((t) => t.type === "redeem");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Loyalty program"
        description="₹10 spent = 1 point · 100 points = ₹100 reward"
      />

      <div className="grid grid-cols-3 gap-3">
        <MetricCard compact label="Members with points" value={accounts.length} />
        <MetricCard compact label="Points outstanding" value={totalPoints} />
        <MetricCard
          compact
          label="Reward liability"
          value={liability}
          format={(n) => inr(n, { compact: true })}
          hint="calculated · demo"
        />
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Gift className="size-4 text-primary" aria-hidden />
          Program rules
        </h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Earning</dt>
            <dd className="mt-0.5 font-medium">1 point per ₹10 paid at POS</dd>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Redemption</dt>
            <dd className="mt-0.5 font-medium">₹100 off per 100 points, at checkout</dd>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Tiers</dt>
            <dd className="mt-0.5 font-medium">Bronze → Silver (150) → Gold (350)</dd>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Redemptions to date</dt>
            <dd className="mt-0.5 font-medium">{redemptions.length} redemptions</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Top point holders
        </h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {top.map((account) => {
            const customer = customerById(data, account.customerId);
            if (!customer) return null;
            return (
              <li
                key={account.customerId}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3.5"
              >
                <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{customer.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {account.tier} · {account.visitStreak} visit streak
                  </p>
                </div>
                <span className="font-heading font-semibold tabular-nums">
                  {account.points} pts
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
