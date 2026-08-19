"use client";

import { useState } from "react";
import { isSameDay } from "date-fns";
import { toast } from "sonner";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { useDemoStore } from "@/lib/store";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const BRANCH_ID = "br_kakkanad";
const OPENING_CASH = 2000;

export default function ReceptionClosingPage() {
  const data = useDemoStore((s) => s.data);
  const closeRegister = useDemoStore((s) => s.closeRegister);
  const [actualCash, setActualCash] = useState<number | "">("");
  const [closed, setClosed] = useState(false);

  const now = new Date();
  const todayInvoices = data.invoices.filter(
    (i) => i.branchId === BRANCH_ID && isSameDay(new Date(i.createdAt), now)
  );

  const byMethod = new Map<string, number>();
  for (const inv of todayInvoices) {
    for (const pm of inv.paymentMethods) {
      byMethod.set(pm.method, (byMethod.get(pm.method) ?? 0) + pm.amount);
    }
  }
  const cashSales = byMethod.get("cash") ?? 0;
  const upiSales = byMethod.get("upi") ?? 0;
  const cardSales = byMethod.get("card") ?? 0;
  const walletSales = byMethod.get("wallet") ?? 0;
  const advanceApplied = byMethod.get("advance") ?? 0;
  const refunds = 0;
  const todayExpenses = data.expenses
    .filter(
      (e) => e.branchId === BRANCH_ID && isSameDay(new Date(e.date), now)
    )
    .reduce((s, e) => s + e.amount, 0);

  const expectedCash = OPENING_CASH + cashSales - refunds - todayExpenses;
  const difference = actualCash === "" ? null : actualCash - expectedCash;

  const rows: Array<[string, number, string?]> = [
    ["Opening cash", OPENING_CASH],
    ["Cash sales", cashSales],
    ["UPI sales", upiSales, "settles to bank"],
    ["Card sales", cardSales, "settles to bank"],
    ["Wallet redemptions", walletSales],
    ["Advance adjustments", advanceApplied, "prepaid online"],
    ["Refunds", -refunds],
    ["Cash expenses", -todayExpenses],
  ];

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeader
        title="Daily closing"
        description={now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      />

      <section className="rounded-2xl border bg-card p-5">
        <dl className="grid gap-2 text-sm">
          {rows.map(([label, value, hint]) => (
            <div key={label} className="flex items-baseline justify-between">
              <dt className="text-muted-foreground">
                {label}
                {hint && <span className="ml-1.5 text-[10px]">({hint})</span>}
              </dt>
              <dd className={cn("tabular-nums", value < 0 && "text-destructive")}>
                {value < 0 ? `−${inr(-value)}` : inr(value)}
              </dd>
            </div>
          ))}
          <Separator className="my-1" />
          <div className="flex items-baseline justify-between font-semibold">
            <dt>Expected cash in drawer</dt>
            <dd className="font-heading text-lg tabular-nums">{inr(expectedCash)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="grid gap-1.5">
          <Label htmlFor="actual-cash">Actual counted cash</Label>
          <Input
            id="actual-cash"
            type="number"
            inputMode="numeric"
            placeholder={String(expectedCash)}
            value={actualCash}
            onChange={(e) =>
              setActualCash(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="h-12 text-lg tabular-nums"
            disabled={closed}
          />
        </div>
        {difference !== null && (
          <p
            className={cn(
              "mt-3 rounded-xl px-4 py-2.5 text-sm font-medium",
              difference === 0 && "bg-success/10 text-success",
              difference > 0 && "bg-info/10 text-info",
              difference < 0 && "bg-destructive/10 text-destructive"
            )}
          >
            {difference === 0
              ? "Perfect match — drawer balances."
              : difference > 0
                ? `Over by ${inr(difference)}`
                : `Short by ${inr(-difference)}`}
          </p>
        )}
        <Button
          size="lg"
          className="mt-4 h-12 w-full"
          disabled={actualCash === "" || closed}
          onClick={() => {
            closeRegister(BRANCH_ID, Number(actualCash));
            setClosed(true);
            toast.success("Register closed", {
              description: "Summary sent to the owner (simulated).",
            });
          }}
        >
          {closed ? (
            <>
              <Check className="size-5" aria-hidden />
              Register closed
            </>
          ) : (
            <>
              <Lock className="size-5" aria-hidden />
              Close register
            </>
          )}
        </Button>
      </section>
    </div>
  );
}
