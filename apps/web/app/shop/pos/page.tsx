"use client";

// Checkout for the unified shop app — same POS engine the reception area
// uses, bound to the active scenario's branch.

import { Suspense } from "react";
import { Pos } from "@/components/reception/pos";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoStore } from "@/lib/store";

export default function ShopPosPage() {
  const branchId = useDemoStore((s) => s.data.branchId);
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Checkout</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <Pos branchId={branchId} />
      </Suspense>
    </div>
  );
}
