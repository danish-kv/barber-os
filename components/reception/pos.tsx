"use client";

// POS checkout. Mobile: stacked order → adjust → pay. Desktop: split panel.
// Linked to an appointment via ?appointment=, or standalone with customer pick.

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Banknote,
  Check,
  CreditCard,
  Gift,
  Loader2,
  Minus,
  Plus,
  Receipt,
  Scissors,
  ShoppingBag,
  Smartphone,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { customerById, serviceNames, staffById } from "@/lib/selectors";
import { SERVICES, MEMBERSHIP_PLANS, STAFF } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";
import type { Appointment, Invoice, InvoiceLineItem, PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

let liCounter = 0;
const liId = () => `li_pos_${Date.now().toString(36)}_${++liCounter}`;

const PAY_METHODS: Array<{ id: PaymentMethod; label: string; icon: typeof Smartphone }> = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "split", label: "Split", icon: Receipt },
];

export function Pos({ branchId }: { branchId: string }) {
  const searchParams = useSearchParams();
  const apptParam = searchParams.get("appointment");
  // Keyed remount re-initializes basket state whenever the linked appointment changes.
  return (
    <PosInner
      key={apptParam ?? "walk-up"}
      branchId={branchId}
      appointmentId={apptParam}
    />
  );
}

function PosInner({
  branchId,
  appointmentId,
}: {
  branchId: string;
  appointmentId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const data = useDemoStore((s) => s.data);
  const checkout = useDemoStore((s) => s.checkout);

  const appointment: Appointment | null = appointmentId
    ? (data.appointments.find((a) => a.id === appointmentId) ?? null)
    : null;

  const [customerId, setCustomerId] = useState<string | null>(
    () => appointment?.customerId ?? null
  );
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(() =>
    appointment
      ? (appointment.serviceIds
          .map((sid) => {
            const svc = SERVICES.find((s) => s.id === sid);
            if (!svc) return null;
            return {
              id: liId(),
              kind: "service" as const,
              refId: sid,
              name: svc.name,
              price: svc.price,
              qty: 1,
              staffId: appointment.staffId ?? undefined,
            };
          })
          .filter(Boolean) as InvoiceLineItem[])
      : []
  );
  const [discount, setDiscount] = useState(0);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [tip, setTip] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [splitCash, setSplitCash] = useState(0);
  const [customerSheet, setCustomerSheet] = useState(false);
  const [productSheet, setProductSheet] = useState(false);
  const [serviceSheet, setServiceSheet] = useState(false);
  const [query, setQuery] = useState("");
  const [paying, setPaying] = useState(false);
  const [payPhase, setPayPhase] = useState<"processing" | "success">("processing");
  const [receipt, setReceipt] = useState<Invoice | null>(null);

  const customer = customerId ? customerById(data, customerId) : undefined;
  const loyalty = customerId
    ? data.loyaltyAccounts.find((l) => l.customerId === customerId)
    : undefined;
  const membership = customerId
    ? data.memberships.find((m) => m.customerId === customerId && m.status === "active")
    : undefined;
  const plan = membership
    ? MEMBERSHIP_PLANS.find((p) => p.id === membership.planId)
    : undefined;

  const sellableProducts = data.inventory.filter(
    (i) => i.branchId === branchId && i.sellable && i.quantity > 0
  );

  // ---- preview math (mirrors store.checkout rules) ----
  const subtotal = lineItems.reduce((s, li) => s + li.price * li.qty, 0);

  const membershipDiscount = useMemo(() => {
    if (!membership || !plan) return 0;
    let disc = 0;
    const usageDelta: Record<string, number> = {};
    for (const li of lineItems) {
      if (li.kind !== "service") continue;
      const inc = plan.includedServices.find((i) => i.serviceId === li.refId);
      if (!inc) continue;
      const used = (membership.usage[li.refId] ?? 0) + (usageDelta[li.refId] ?? 0);
      const remaining = inc.qty - used;
      if (remaining > 0) {
        const freeQty = Math.min(remaining, li.qty);
        disc += li.price * freeQty;
        usageDelta[li.refId] = (usageDelta[li.refId] ?? 0) + freeQty;
      }
    }
    const productSubtotal = lineItems
      .filter((li) => li.kind === "product")
      .reduce((s, li) => s + li.price * li.qty, 0);
    disc += Math.round((productSubtotal * plan.discountPercent) / 100);
    return disc;
  }, [lineItems, membership, plan]);

  const maxLoyaltyBlocks = Math.floor((loyalty?.points ?? 0) / 100);
  const afterDiscounts = Math.max(0, subtotal - discount - membershipDiscount);
  const usableBlocks = Math.min(maxLoyaltyBlocks, Math.floor(afterDiscounts / 100));
  const loyaltyPointsUsed = useLoyalty ? usableBlocks * 100 : 0;
  const advance = appointment?.advancePaid ? (appointment.advanceAmount ?? 0) : 0;
  const fullPrepaid =
    appointment?.paymentPreference === "full" && appointment.advancePaid;
  const prepaidAmount = fullPrepaid ? subtotal : advance;
  const total = Math.max(
    0,
    afterDiscounts - loyaltyPointsUsed + tip - prepaidAmount
  );

  const updateQty = (id: string, delta: number) => {
    setLineItems((prev) =>
      prev
        .map((li) => (li.id === id ? { ...li, qty: li.qty + delta } : li))
        .filter((li) => li.qty > 0)
    );
  };

  const addProduct = (itemId: string) => {
    const item = data.inventory.find((i) => i.id === itemId);
    if (!item || !item.sellPrice) return;
    setLineItems((prev) => {
      const existing = prev.find((li) => li.kind === "product" && li.refId === itemId);
      if (existing) {
        return prev.map((li) =>
          li.id === existing.id ? { ...li, qty: li.qty + 1 } : li
        );
      }
      return [
        ...prev,
        {
          id: liId(),
          kind: "product",
          refId: itemId,
          name: item.name,
          price: item.sellPrice!,
          qty: 1,
          staffId: appointment?.staffId ?? undefined,
        },
      ];
    });
    setProductSheet(false);
  };

  const addService = (serviceId: string) => {
    const svc = SERVICES.find((s) => s.id === serviceId);
    if (!svc) return;
    setLineItems((prev) => [
      ...prev,
      {
        id: liId(),
        kind: "service",
        refId: serviceId,
        name: svc.name,
        price: svc.price,
        qty: 1,
        staffId: appointment?.staffId ?? undefined,
      },
    ]);
    setServiceSheet(false);
  };

  const matches = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return data.customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
      .slice(0, 6);
  }, [data.customers, query]);

  const canPay = customerId && lineItems.length > 0;

  const doCheckout = () => {
    if (!customerId) return;
    const paymentMethods: Array<{ method: PaymentMethod; amount: number }> =
      method === "split"
        ? [
            { method: "cash", amount: Math.min(splitCash, total) },
            { method: "upi", amount: Math.max(0, total - splitCash) },
          ]
        : [{ method, amount: total }];

    const run = () => {
      const invoice = checkout({
        appointmentId: appointment?.id,
        customerId,
        branchId,
        lineItems,
        discount,
        loyaltyPointsUsed,
        tip,
        paymentMethods,
      });
      setReceipt(invoice);
      setPaying(false);
      toast.success(`Payment collected · ${inr(invoice.total)}`, {
        description: `Receipt ${invoice.receiptNumber}`,
      });
    };

    if (method === "upi" || method === "split") {
      setPaying(true);
      setPayPhase("processing");
      setTimeout(() => {
        setPayPhase("success");
        setTimeout(run, 700);
      }, 1400);
    } else {
      run();
    }
  };

  const resetPos = () => {
    setCustomerId(null);
    setLineItems([]);
    setDiscount(0);
    setUseLoyalty(false);
    setTip(0);
    setMethod("upi");
    setReceipt(null);
    // Clearing ?appointment changes this component's key → fully fresh basket.
    router.replace(pathname as "/");
  };

  // ------------------------------- RECEIPT -------------------------------
  if (receipt) {
    return <ReceiptView invoice={receipt} onNew={resetPos} />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      {/* ------------------------------ ORDER ------------------------------ */}
      <div className="grid gap-4">
        {/* Customer */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Customer
          </h2>
          {customer ? (
            <div className="flex items-center gap-3">
              <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.phone}
                  {membership && plan && (
                    <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                      {plan.name}
                    </span>
                  )}
                </p>
                {appointment && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Linked: {serviceNames(appointment.serviceIds)}
                    {appointment.staffId &&
                      ` · ${staffById(appointment.staffId)?.name}`}
                  </p>
                )}
              </div>
              {!appointment && (
                <Button variant="ghost" size="sm" onClick={() => setCustomerSheet(true)}>
                  Change
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              className="h-12 w-full justify-start"
              onClick={() => setCustomerSheet(true)}
            >
              <UserRound className="size-4" aria-hidden />
              Select customer…
            </Button>
          )}
        </section>

        {/* Items */}
        <section className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Items
            </h2>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setServiceSheet(true)}>
                <Scissors className="size-3.5" aria-hidden />
                Service
              </Button>
              <Button variant="outline" size="sm" onClick={() => setProductSheet(true)}>
                <ShoppingBag className="size-3.5" aria-hidden />
                Product
              </Button>
            </div>
          </div>
          {lineItems.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Empty basket"
              description="Add services or retail products to begin checkout."
              className="py-8"
            />
          ) : (
            <ul className="grid gap-2">
              {lineItems.map((li) => (
                <li
                  key={li.id}
                  className="flex items-center gap-3 rounded-xl border bg-background p-3"
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      li.kind === "product"
                        ? "bg-chart-4/15 text-chart-4"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {li.kind === "product" ? (
                      <ShoppingBag className="size-4" aria-hidden />
                    ) : (
                      <Scissors className="size-4" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{li.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inr(li.price)}
                      {li.qty > 1 && ` × ${li.qty}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label={`Decrease ${li.name}`}
                      onClick={() => updateQty(li.id, -1)}
                    >
                      {li.qty === 1 ? (
                        <Trash2 className="size-3.5" />
                      ) : (
                        <Minus className="size-3.5" />
                      )}
                    </Button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">
                      {li.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label={`Increase ${li.name}`}
                      onClick={() => updateQty(li.id, 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <span className="w-16 text-right font-medium tabular-nums">
                    {inr(li.price * li.qty)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Adjustments */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Adjustments
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="pos-discount">Discount (₹)</Label>
              <Input
                id="pos-discount"
                type="number"
                inputMode="numeric"
                min={0}
                value={discount || ""}
                placeholder="0"
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                className="h-10"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Tip</Label>
              <div className="flex gap-1.5">
                {[0, 20, 50, 100].map((v) => (
                  <Button
                    key={v}
                    type="button"
                    variant={tip === v ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTip(v)}
                  >
                    {v === 0 ? "None" : `₹${v}`}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          {loyalty && maxLoyaltyBlocks > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/60 p-3">
              <div className="flex items-center gap-2.5">
                <Gift className="size-4 text-primary" aria-hidden />
                <div>
                  <p className="text-sm font-medium">
                    Redeem {usableBlocks * 100} points
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {loyalty.points} points available · ₹{usableBlocks * 100} off
                  </p>
                </div>
              </div>
              <Switch
                checked={useLoyalty}
                onCheckedChange={setUseLoyalty}
                aria-label="Redeem loyalty points"
              />
            </div>
          )}
        </section>
      </div>

      {/* ------------------------------ PAYMENT ------------------------------ */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Payment
          </h2>
          <dl className="grid gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{inr(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-destructive">
                <dt>Discount</dt>
                <dd className="tabular-nums">−{inr(discount)}</dd>
              </div>
            )}
            {membershipDiscount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Membership</dt>
                <dd className="tabular-nums">−{inr(membershipDiscount)}</dd>
              </div>
            )}
            {loyaltyPointsUsed > 0 && (
              <div className="flex justify-between text-success">
                <dt>Loyalty redemption</dt>
                <dd className="tabular-nums">−{inr(loyaltyPointsUsed)}</dd>
              </div>
            )}
            {tip > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tip</dt>
                <dd className="tabular-nums">{inr(tip)}</dd>
              </div>
            )}
            {prepaidAmount > 0 && (
              <div className="flex justify-between text-success">
                <dt>{fullPrepaid ? "Paid online" : "Advance paid"}</dt>
                <dd className="tabular-nums">−{inr(prepaidAmount)}</dd>
              </div>
            )}
            <Separator className="my-1.5" />
            <div className="flex items-baseline justify-between">
              <dt className="font-semibold">To collect</dt>
              <dd className="font-heading text-2xl font-semibold tabular-nums">
                {inr(total)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-5 gap-1.5">
            {PAY_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                aria-pressed={method === m.id}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[11px] font-medium transition-colors",
                  method === m.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "bg-background hover:bg-muted"
                )}
              >
                <m.icon className="size-4.5" aria-hidden />
                {m.label}
              </button>
            ))}
          </div>

          {method === "split" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label htmlFor="split-cash" className="text-xs">
                  Cash portion
                </Label>
                <Input
                  id="split-cash"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={total}
                  value={splitCash || ""}
                  placeholder="0"
                  onChange={(e) =>
                    setSplitCash(Math.min(total, Math.max(0, Number(e.target.value) || 0)))
                  }
                  className="h-10"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">UPI portion</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 text-sm tabular-nums">
                  {inr(Math.max(0, total - splitCash))}
                </div>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="mt-4 h-12 w-full text-base"
            disabled={!canPay}
            onClick={doCheckout}
          >
            {total === 0 ? "Complete (nothing due)" : `Collect ${inr(total)}`}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Payments are simulated — no real transaction occurs.
          </p>
        </section>
      </div>

      {/* Sheets */}
      <BottomSheet
        open={customerSheet}
        onOpenChange={setCustomerSheet}
        title="Select customer"
      >
        <div className="grid gap-2 pb-4">
          <Input
            placeholder="Search name or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11"
            autoFocus
          />
          {matches.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCustomerId(c.id);
                setCustomerSheet(false);
                setQuery("");
              }}
              className="flex items-center gap-3 rounded-xl border p-3 text-left hover:bg-muted/60"
            >
              <ToneAvatar name={c.name} toneName={c.avatarTone} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{c.name}</span>
                <span className="block text-xs text-muted-foreground">{c.phone}</span>
              </span>
            </button>
          ))}
          {query.length >= 2 && matches.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No customers match &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </BottomSheet>

      <BottomSheet
        open={serviceSheet}
        onOpenChange={setServiceSheet}
        title="Add service"
      >
        <div className="grid gap-1.5 pb-4">
          {SERVICES.filter((s) => s.branchIds.includes(branchId)).map((svc) => (
            <button
              key={svc.id}
              onClick={() => addService(svc.id)}
              className="flex items-center justify-between rounded-xl border p-3 text-left hover:bg-muted/60"
            >
              <span className="text-sm font-medium">{svc.name}</span>
              <span className="text-sm tabular-nums">{inr(svc.price)}</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        open={productSheet}
        onOpenChange={setProductSheet}
        title="Add product"
      >
        <div className="grid gap-1.5 pb-4">
          {sellableProducts.map((item) => (
            <button
              key={item.id}
              onClick={() => addProduct(item.id)}
              className="flex items-center justify-between rounded-xl border p-3 text-left hover:bg-muted/60"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.quantity} {item.unit} in stock
                </span>
              </span>
              <span className="text-sm tabular-nums">{inr(item.sellPrice ?? 0)}</span>
            </button>
          ))}
          {sellableProducts.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No retail products in stock at this branch.
            </p>
          )}
        </div>
      </BottomSheet>

      {/* Simulated UPI processing */}
      <BottomSheet
        open={paying}
        onOpenChange={(o) => {
          if (!o && payPhase === "processing") return;
          setPaying(o);
        }}
        title="UPI Payment"
        description="Simulated — no real money moves"
      >
        <div className="flex flex-col items-center py-6">
          {payPhase === "processing" ? (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-info/10">
                <Smartphone className="size-7 animate-pulse text-info" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-medium">Waiting for customer&apos;s UPI app…</p>
              <Loader2 className="mt-3 size-5 animate-spin text-muted-foreground" aria-hidden />
            </>
          ) : (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-success/10">
                <Check className="size-8 text-success" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold">Payment received</p>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ReceiptView({ invoice, onNew }: { invoice: Invoice; onNew: () => void }) {
  const data = useDemoStore((s) => s.data);
  const customer = customerById(data, invoice.customerId);
  const staffNames = [
    ...new Set(
      invoice.lineItems
        .map((li) => li.staffId)
        .filter(Boolean)
        .map((id) => STAFF.find((s) => s.id === id)?.name)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="mx-auto max-w-md">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/10 animate-in zoom-in-50">
          <Check className="size-7 text-success" aria-hidden />
        </span>
        <h2 className="mt-3 font-heading text-xl font-semibold">Payment complete</h2>
        <p className="text-sm text-muted-foreground">
          {inr(invoice.total)} collected from {customer?.name}
        </p>
      </div>

      {/* Receipt */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border bg-card shadow-lg">
        <div className="bg-sidebar px-6 py-5 text-center text-sidebar-foreground">
          <p className="font-heading text-lg font-semibold text-sidebar-accent-foreground">
            Royal Cuts
          </p>
          <p className="text-xs text-sidebar-foreground/70">
            Kakkanad, Kochi · +91 9847 12 3401
          </p>
        </div>
        <div className="px-6 py-5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Receipt {invoice.receiptNumber}</span>
            <span>
              {new Date(invoice.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <Separator className="my-3" />
          <ul className="grid gap-1.5 text-sm">
            {invoice.lineItems.map((li) => (
              <li key={li.id} className="flex justify-between">
                <span>
                  {li.name}
                  {li.qty > 1 && ` × ${li.qty}`}
                </span>
                <span className="tabular-nums">{inr(li.price * li.qty)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-3" />
          <dl className="grid gap-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{inr(invoice.subtotal)}</dd>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Discount</dt>
                <dd className="tabular-nums">−{inr(invoice.discount)}</dd>
              </div>
            )}
            {invoice.membershipDiscount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Membership</dt>
                <dd className="tabular-nums">−{inr(invoice.membershipDiscount)}</dd>
              </div>
            )}
            {invoice.loyaltyRedeemed > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Loyalty</dt>
                <dd className="tabular-nums">−{inr(invoice.loyaltyRedeemed)}</dd>
              </div>
            )}
            {invoice.tip > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Tip</dt>
                <dd className="tabular-nums">{inr(invoice.tip)}</dd>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t pt-2 font-semibold">
              <dt>Total paid</dt>
              <dd className="font-heading tabular-nums">{inr(invoice.total)}</dd>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <dt>
                {invoice.paymentMethods
                  .map((pm) => `${pm.method.toUpperCase()} ${inr(pm.amount)}`)
                  .join(" + ")}
              </dt>
              {staffNames.length > 0 && <dd>Served by {staffNames.join(", ")}</dd>}
            </div>
          </dl>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Thank you for visiting! You earned{" "}
            <strong>{Math.floor(invoice.total / 10)} points</strong> on this visit.
          </p>
        </div>
        {/* perforated edge */}
        <div
          aria-hidden
          className="h-3 w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 8px -2px, transparent 6px, var(--card) 7px)",
            backgroundSize: "16px 12px",
            backgroundColor: "var(--background)",
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => toast.success("Receipt sent via WhatsApp (simulated)")}
        >
          Send on WhatsApp
        </Button>
        <Button onClick={onNew}>New checkout</Button>
      </div>
    </div>
  );
}
