"use client";

import { Wallet, ArrowDownLeft, ArrowUpRight, Gift } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { inr, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const CUSTOMER_ID = "cu_danish";

export default function CustomerWalletPage() {
  const data = useDemoStore((s) => s.data);
  const loyalty = data.loyaltyAccounts.find((l) => l.customerId === CUSTOMER_ID);

  // Wallet balance is simulated: refunds from cancellations with advance paid.
  const refunds = data.appointments.filter(
    (a) =>
      a.customerId === CUSTOMER_ID &&
      a.status === "cancelled" &&
      a.advancePaid &&
      a.cancelReason === "Cancelled by customer"
  );
  const balance = refunds.reduce((s, a) => s + (a.advanceAmount ?? 0), 0);

  const payments = data.invoices
    .filter((i) => i.customerId === CUSTOMER_ID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Wallet</h1>

      <section className="rounded-3xl border bg-card p-6 shadow-xs">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          <Wallet className="size-4" aria-hidden />
          Wallet balance
        </p>
        <p className="mt-2 font-heading text-4xl font-semibold">{inr(balance)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Refunds from cancelled bookings land here and auto-apply at your next
          checkout.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-3 text-sm">
          <Gift className="size-4 text-primary" aria-hidden />
          <span>
            Plus <strong>{loyalty?.points ?? 0} loyalty points</strong> (worth{" "}
            {inr(Math.floor((loyalty?.points ?? 0) / 100) * 100)})
          </span>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Recent transactions
        </h2>
        <ul className="grid gap-1.5">
          {refunds.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-success/10 text-success">
                <ArrowDownLeft className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Advance refund</p>
                <p className="text-xs text-muted-foreground">
                  Cancelled booking · {relativeTime(r.cancelledAt ?? r.start)}
                </p>
              </div>
              <span className="font-medium text-success tabular-nums">
                +{inr(r.advanceAmount ?? 0)}
              </span>
            </li>
          ))}
          {payments.map((inv) => (
            <li key={inv.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Payment · {inv.receiptNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inv.paymentMethods.map((p) => p.method.toUpperCase()).join(" + ")} ·{" "}
                  {relativeTime(inv.createdAt)}
                </p>
              </div>
              <span className={cn("font-medium tabular-nums")}>−{inr(inv.total)}</span>
            </li>
          ))}
          {refunds.length === 0 && payments.length === 0 && (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              No wallet activity yet.
            </p>
          )}
        </ul>
      </section>
    </div>
  );
}
