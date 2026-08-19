"use client";

import { QueueBoard } from "@/components/reception/queue-board";

export default function StaffQueuePage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Queue</h1>
      <QueueBoard branchId="br_kakkanad" posHrefBase="/reception/pos" />
    </div>
  );
}
