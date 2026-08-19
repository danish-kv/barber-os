"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DayCalendar } from "@/components/calendar/day-calendar";
import { useDemoStore } from "@/lib/store";
import { branchById } from "@/lib/selectors";

export default function OwnerCalendarPage() {
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const branchId = branchFilter === "all" ? "br_kakkanad" : branchFilter;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Calendar"
        description={
          branchFilter === "all"
            ? "Showing Kakkanad — pick a branch in the header to switch"
            : `${branchById(branchId)?.name} · all staff lanes`
        }
      />
      <DayCalendar branchId={branchId} />
    </div>
  );
}
