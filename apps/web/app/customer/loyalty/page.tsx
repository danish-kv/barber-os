"use client";

import { Flame, Gift, Sparkles, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDemoStore } from "@/lib/store";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const CUSTOMER_ID = "cu_danish";

const REWARDS = [
  { points: 100, label: "₹100 off any service", icon: Gift },
  { points: 250, label: "Free Head Massage", icon: Sparkles },
  { points: 500, label: "Free Premium Haircut", icon: TrendingUp },
];

export default function CustomerLoyaltyPage() {
  const data = useDemoStore((s) => s.data);
  const loyalty = data.loyaltyAccounts.find((l) => l.customerId === CUSTOMER_ID);
  const transactions = data.loyaltyTransactions
    .filter((t) => t.customerId === CUSTOMER_ID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const points = loyalty?.points ?? 0;
  const toNext = 100 - (points % 100);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Royal Rewards
      </h1>

      {/* Hero card */}
      <section className="relative overflow-hidden rounded-3xl bg-sidebar p-6 text-sidebar-foreground shadow-lg">
        <div
          aria-hidden
          className="absolute -top-10 -right-10 size-40 rounded-full bg-sidebar-primary/10"
        />
        <p className="text-xs font-semibold tracking-widest text-sidebar-primary uppercase">
          Points balance
        </p>
        <p className="mt-2 font-heading text-5xl font-semibold text-sidebar-accent-foreground">
          {points}
        </p>
        <Progress
          value={(points % 100)}
          className="mt-4 h-2 bg-sidebar-accent"
        />
        <p className="mt-2 text-sm text-sidebar-foreground/80">
          <strong className="text-sidebar-accent-foreground">{toNext} points</strong> until
          your next ₹100 reward
        </p>
        <div className="mt-4 flex items-center gap-4 border-t border-sidebar-border pt-4">
          <span className="flex items-center gap-1.5 text-sm">
            <Flame className="size-4 text-sidebar-primary" aria-hidden />
            {loyalty?.visitStreak ?? 0}-visit streak
          </span>
          <span className="rounded-full bg-sidebar-accent px-2.5 py-0.5 text-xs font-semibold text-sidebar-accent-foreground capitalize">
            {loyalty?.tier ?? "bronze"} tier
          </span>
        </div>
      </section>

      {/* Rewards */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Available rewards
        </h2>
        <div className="grid gap-2">
          {REWARDS.map((reward) => {
            const unlocked = points >= reward.points;
            return (
              <div
                key={reward.points}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border bg-card p-4",
                  unlocked && "border-primary/40"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  <reward.icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{reward.label}</p>
                  <p className="text-xs text-muted-foreground">{reward.points} points</p>
                </div>
                <Button
                  size="sm"
                  variant={unlocked ? "default" : "outline"}
                  disabled={!unlocked}
                  onClick={() =>
                    toast.success("Reward ready!", {
                      description: "Show this at the counter — reception applies it at checkout.",
                    })
                  }
                >
                  {unlocked ? "Redeem" : `${reward.points - points} more`}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Points are redeemed at checkout by reception. ₹10 spent = 1 point.
        </p>
      </section>

      {/* History */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Points history
        </h2>
        <ul className="grid gap-1.5">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{tx.reason}</p>
                <p className="text-xs text-muted-foreground">{relativeTime(tx.createdAt)}</p>
              </div>
              <span
                className={cn(
                  "font-heading text-sm font-semibold tabular-nums",
                  tx.points >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {tx.points >= 0 ? "+" : ""}
                {tx.points}
              </span>
            </li>
          ))}
          {transactions.length === 0 && (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              Earn points on your first visit!
            </p>
          )}
        </ul>
      </section>
    </div>
  );
}
