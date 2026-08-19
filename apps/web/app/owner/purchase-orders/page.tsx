"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, Package, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { branchById } from "@/lib/selectors";
import { VENDORS } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

function PurchaseOrdersInner() {
  const searchParams = useSearchParams();
  const data = useDemoStore((s) => s.data);
  const createPurchaseOrder = useDemoStore((s) => s.createPurchaseOrder);
  const receivePurchaseOrder = useDemoStore((s) => s.receivePurchaseOrder);

  const [createOpen, setCreateOpen] = useState(searchParams.get("new") === "1");
  const [vendorId, setVendorId] = useState(
    searchParams.get("vendor") ?? VENDORS[0].id
  );
  const [branchId, setBranchId] = useState("br_kakkanad");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const orders = [...data.purchaseOrders].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );

  const vendorItems = useMemo(
    () =>
      data.inventory.filter(
        (i) => i.vendorId === vendorId && i.branchId === branchId
      ),
    [data.inventory, vendorId, branchId]
  );

  const orderTotal = vendorItems.reduce(
    (s, item) => s + (quantities[item.id] ?? 0) * item.costPrice,
    0
  );
  const hasItems = Object.values(quantities).some((q) => q > 0);

  const submit = () => {
    const items = vendorItems
      .filter((i) => (quantities[i.id] ?? 0) > 0)
      .map((i) => ({ itemId: i.id, qty: quantities[i.id], unitCost: i.costPrice }));
    if (items.length === 0) return;
    const po = createPurchaseOrder({ branchId, vendorId, items });
    toast.success(`Purchase order placed · ${inr(po.total)}`, {
      description: `${VENDORS.find((v) => v.id === vendorId)?.name} — expected in 2 days.`,
    });
    setQuantities({});
    setCreateOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Purchase orders"
        description="Receive stock to update inventory instantly"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New order
          </Button>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No purchase orders"
          actionLabel="Create one"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <ul className="grid gap-2">
          {orders.map((po) => {
            const vendor = VENDORS.find((v) => v.id === po.vendorId);
            return (
              <li key={po.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      po.status === "received"
                        ? "bg-success/10 text-success"
                        : po.status === "ordered"
                          ? "bg-info/10 text-info"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Package className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {vendor?.name}
                      <span className="ml-2 font-normal text-muted-foreground">
                        · {branchById(po.branchId)?.name}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {po.items
                        .map((i) => {
                          const item = data.inventory.find((x) => x.id === i.itemId);
                          return `${i.qty}× ${item?.name ?? i.itemId}`;
                        })
                        .join(", ")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Placed {format(new Date(po.createdAt), "d MMM")} ·{" "}
                      {po.status === "received"
                        ? `received ${format(new Date(po.receivedAt!), "d MMM")}`
                        : `expected ${format(new Date(po.expectedAt), "d MMM")}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-heading text-sm font-semibold tabular-nums">
                      {inr(po.total)}
                    </span>
                    {po.status === "ordered" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          receivePurchaseOrder(po.id);
                          toast.success("Stock received", {
                            description: "Inventory quantities updated.",
                          });
                        }}
                      >
                        <Check className="size-4" aria-hidden />
                        Receive
                      </Button>
                    ) : (
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
                          po.status === "received"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {po.status}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Create PO sheet */}
      <BottomSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New purchase order"
        contentClassName="sm:max-w-lg"
      >
        <div className="grid gap-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <Select value={vendorId} onValueChange={setVendorId}>
              <SelectTrigger aria-label="Vendor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VENDORS.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger aria-label="Branch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["br_kakkanad", "br_edappally", "br_panampilly", "br_tvm"].map((id) => (
                  <SelectItem key={id} value={id}>
                    {branchById(id)?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            {vendorItems.map((item) => {
              const low = item.quantity <= item.minQuantity;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border bg-background p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {item.name}
                      {low && (
                        <span className="ml-2 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-semibold text-destructive uppercase">
                          Low
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} in stock · {inr(item.costPrice)}/{item.unit}
                    </p>
                  </div>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    aria-label={`Order quantity for ${item.name}`}
                    value={quantities[item.id] || ""}
                    onChange={(e) =>
                      setQuantities((q) => ({
                        ...q,
                        [item.id]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="h-10 w-20 text-center tabular-nums"
                  />
                </div>
              );
            })}
            {vendorItems.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                This vendor has no items at the selected branch.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm text-muted-foreground">Order total</span>
            <span className="font-heading text-lg font-semibold tabular-nums">
              {inr(orderTotal)}
            </span>
          </div>
          <Button size="lg" disabled={!hasItems} onClick={submit}>
            Place order
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

export default function OwnerPurchaseOrdersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <PurchaseOrdersInner />
    </Suspense>
  );
}
