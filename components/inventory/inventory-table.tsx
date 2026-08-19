"use client";

// Inventory list — responsive: cards on mobile, table on desktop.
// Shared by manager and owner (owner gets adjust/PO actions).

import { toast } from "sonner";
import { Minus, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { branchById } from "@/lib/selectors";
import { VENDORS } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export function InventoryTable({
  branchFilter,
  editable = false,
  lowOnly = false,
}: {
  branchFilter: string;
  editable?: boolean;
  lowOnly?: boolean;
}) {
  const data = useDemoStore((s) => s.data);
  const adjustStock = useDemoStore((s) => s.adjustStock);

  const items = data.inventory
    .filter((i) => branchFilter === "all" || i.branchId === branchFilter)
    .filter((i) => !lowOnly || i.quantity <= i.minQuantity)
    .sort((a, b) => {
      const aLow = a.quantity <= a.minQuantity ? 0 : 1;
      const bLow = b.quantity <= b.minQuantity ? 0 : 1;
      return aLow - bLow || a.name.localeCompare(b.name);
    });

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={lowOnly ? "Nothing low on stock" : "No inventory items"}
        description={lowOnly ? "All items are above minimum levels." : undefined}
      />
    );
  }

  const adjust = (id: string, delta: number, name: string) => {
    adjustStock(id, delta);
    toast(`${name}: ${delta > 0 ? "+" : ""}${delta}`);
  };

  return (
    <>
      {/* Mobile cards */}
      <ul className="grid gap-2 lg:hidden">
        {items.map((item) => {
          const low = item.quantity <= item.minQuantity;
          return (
            <li key={item.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category}
                    {branchFilter === "all" && ` · ${branchById(item.branchId)?.name}`}
                  </p>
                </div>
                {low && (
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive uppercase">
                    Low stock
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm">
                  <span className={cn("font-heading text-lg font-semibold tabular-nums", low && "text-destructive")}>
                    {item.quantity}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {item.unit} · min {item.minQuantity}
                  </span>
                </p>
                {editable && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label={`Decrease ${item.name}`}
                      onClick={() => adjust(item.id, -1, item.name)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label={`Increase ${item.name}`}
                      onClick={() => adjust(item.id, 1, item.name)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border lg:block">
        <table className="w-full border-collapse bg-card text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th scope="col" className="p-3 font-medium">Item</th>
              <th scope="col" className="p-3 font-medium">Category</th>
              {branchFilter === "all" && (
                <th scope="col" className="p-3 font-medium">Branch</th>
              )}
              <th scope="col" className="p-3 text-right font-medium">Stock</th>
              <th scope="col" className="p-3 text-right font-medium">Min</th>
              <th scope="col" className="p-3 text-right font-medium">Cost</th>
              <th scope="col" className="p-3 font-medium">Vendor</th>
              {editable && <th scope="col" className="p-3 text-right font-medium">Adjust</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const low = item.quantity <= item.minQuantity;
              const vendor = VENDORS.find((v) => v.id === item.vendorId);
              return (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3">
                    <span className="font-medium">{item.name}</span>
                    {low && (
                      <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive uppercase">
                        Low
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{item.category}</td>
                  {branchFilter === "all" && (
                    <td className="p-3 text-muted-foreground">
                      {branchById(item.branchId)?.name}
                    </td>
                  )}
                  <td className={cn("p-3 text-right font-semibold tabular-nums", low && "text-destructive")}>
                    {item.quantity} {item.unit}
                  </td>
                  <td className="p-3 text-right text-muted-foreground tabular-nums">
                    {item.minQuantity}
                  </td>
                  <td className="p-3 text-right text-muted-foreground tabular-nums">
                    {inr(item.costPrice)}
                  </td>
                  <td className="p-3 text-muted-foreground">{vendor?.name}</td>
                  {editable && (
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          aria-label={`Decrease ${item.name}`}
                          onClick={() => adjust(item.id, -1, item.name)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          aria-label={`Increase ${item.name}`}
                          onClick={() => adjust(item.id, 1, item.name)}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
