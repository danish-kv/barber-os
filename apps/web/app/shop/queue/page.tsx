"use client";

import { QueueBoard } from "@/components/reception/queue-board";
import { useDemoStore } from "@/lib/store";

export default function ShopQueuePage() {
  const branchId = useDemoStore((s) => s.data.branchId);
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Queue</h1>
      <QueueBoard branchId={branchId} posHrefBase="/shop/pos" />
    </div>
  );
}
