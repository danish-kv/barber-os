"use client";

import { PageHeader } from "@/components/shared/page-header";
import { LeaveApprovals } from "@/components/staff/leave-approvals";

export default function ManagerLeavePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Leave requests"
        description="Approvals update staff availability and the calendar instantly"
      />
      <LeaveApprovals branchId="br_kakkanad" />
    </div>
  );
}
