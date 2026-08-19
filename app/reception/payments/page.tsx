"use client";

import { isSameDay } from "date-fns";
import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { customerById } from "@/lib/selectors";
import { inr, timeLabel } from "@/lib/format";

const BRANCH_ID = "br_kakkanad";

export default function ReceptionPaymentsPage() {
  const data = useDemoStore((s) => s.data);
  const now = new Date();

  const todayInvoices = data.invoices
    .filter(
      (i) => i.branchId === BRANCH_ID && isSameDay(new Date(i.createdAt), now)
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const byMethod = new Map<string, number>();
  for (const inv of todayInvoices) {
    for (const pm of inv.paymentMethods) {
      byMethod.set(pm.method, (byMethod.get(pm.method) ?? 0) + pm.amount);
    }
  }
  const total = todayInvoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader title="Payments" description="Today's collected payments" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard compact label="Total collected" value={total} format={(n) => inr(n)} />
        <MetricCard compact label="UPI" value={byMethod.get("upi") ?? 0} format={(n) => inr(n)} />
        <MetricCard compact label="Cash" value={byMethod.get("cash") ?? 0} format={(n) => inr(n)} />
        <MetricCard compact label="Card" value={byMethod.get("card") ?? 0} format={(n) => inr(n)} />
      </div>

      {todayInvoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments yet today"
          description="Checkouts from the POS will appear here."
          actionLabel="Open POS"
          actionHref="/reception/pos"
        />
      ) : (
        <ul className="grid gap-2">
          {todayInvoices.map((inv) => {
            const customer = customerById(data, inv.customerId);
            return (
              <li
                key={inv.id}
                className="flex items-center gap-3 rounded-2xl border bg-card p-4"
              >
                {customer && (
                  <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="sm" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {customer?.name} · {inv.receiptNumber}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {inv.lineItems.map((li) => li.name).join(", ")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-heading text-sm font-semibold tabular-nums">
                    {inr(inv.total)}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase">
                    {inv.paymentMethods.map((p) => p.method).join(" + ")} ·{" "}
                    {timeLabel(inv.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
