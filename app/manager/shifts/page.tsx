"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ShiftSchedule } from "@/components/staff/shift-schedule";

export default function ManagerShiftsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Shift schedule"
        description="Weekly roster · approved leave reflects automatically"
      />
      <ShiftSchedule branchId="br_kakkanad" editable />
    </div>
  );
}
