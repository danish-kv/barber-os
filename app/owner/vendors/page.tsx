"use client";

import Link from "next/link";
import { Phone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { useDemoStore } from "@/lib/store";
import { VENDORS } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";

export default function OwnerVendorsPage() {
  const data = useDemoStore((s) => s.data);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader title="Vendors" description="Suppliers and lead times" />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {VENDORS.map((vendor) => {
          const items = data.inventory.filter((i) => i.vendorId === vendor.id);
          const itemNames = [...new Set(items.map((i) => i.name))];
          const pos = data.purchaseOrders.filter((p) => p.vendorId === vendor.id);
          const totalSpend = pos
            .filter((p) => p.status === "received")
            .reduce((s, p) => s + p.total, 0);
          return (
            <div key={vendor.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Truck className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {vendor.contactName} · {vendor.leadTimeDays}-day lead time
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 flex-1 text-xs text-muted-foreground">
                Supplies: {itemNames.join(", ")}
              </p>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  {pos.length} orders · {inr(totalSpend, { compact: true })} spent
                </span>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="icon" className="size-8" asChild>
                    <a
                      href={`tel:${vendor.phone.replace(/\s/g, "")}`}
                      aria-label={`Call ${vendor.name}`}
                    >
                      <Phone className="size-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/owner/purchase-orders?new=1&vendor=${vendor.id}` as "/"}>
                      Order
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
