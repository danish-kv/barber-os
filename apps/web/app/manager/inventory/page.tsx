"use client";

import { PageHeader } from "@/components/shared/page-header";
import { InventoryTable } from "@/components/inventory/inventory-table";

export default function ManagerInventoryPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Inventory"
        description="Branch stock levels · consumables deplete as services complete"
      />
      <InventoryTable branchFilter="br_kakkanad" editable />
    </div>
  );
}
