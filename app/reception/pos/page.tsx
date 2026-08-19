"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Pos } from "@/components/reception/pos";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReceptionPosPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Point of sale"
        description="Checkout services and retail products"
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <Pos branchId="br_kakkanad" />
      </Suspense>
    </div>
  );
}
