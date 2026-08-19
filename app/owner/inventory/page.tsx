"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { useDemoStore } from "@/lib/store";
import { lowStockItems } from "@/lib/selectors";
import { inr } from "@/lib/format";

export default function OwnerInventoryPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const [tab, setTab] = useState("all");

  const items = data.inventory.filter(
    (i) => branchFilter === "all" || i.branchId === branchFilter
  );
  const low = lowStockItems(data, branchFilter);
  const stockValue = items.reduce((s, i) => s + i.quantity * i.costPrice, 0);
  const openPOs = data.purchaseOrders.filter((p) => p.status === "ordered").length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Inventory"
        description="Consumables deplete automatically as services complete"
        actions={
          <Button size="sm" asChild>
            <Link href="/owner/purchase-orders?new=1">
              <ShoppingCart className="size-4" aria-hidden />
              Purchase order
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <MetricCard compact label="Items tracked" value={items.length} />
        <MetricCard compact label="Low stock" value={low.length} />
        <MetricCard compact label="Stock value" value={stockValue} format={(n) => inr(n, { compact: true })} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All items</TabsTrigger>
          <TabsTrigger value="low">
            Low stock {low.length > 0 && `(${low.length})`}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <InventoryTable branchFilter={branchFilter} editable lowOnly={tab === "low"} />

      {openPOs > 0 && (
        <p className="text-xs text-muted-foreground">
          {openPOs} purchase order{openPOs > 1 ? "s" : ""} in transit —{" "}
          <Link href="/owner/purchase-orders" className="font-medium text-primary hover:underline">
            receive stock
          </Link>
        </p>
      )}
    </div>
  );
}
