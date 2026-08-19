"use client";

import { PageHeader } from "@/components/shared/page-header";
import { QueueBoard } from "@/components/reception/queue-board";

export default function ReceptionQueuePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Walk-in queue"
        description="Live queue — walk-ins and checked-in appointments together"
      />
      <QueueBoard branchId="br_kakkanad" />
    </div>
  );
}
