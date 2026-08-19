"use client";

import { subDays } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { StaffPerformanceList } from "@/components/staff/staff-performance-list";
import { useDemoStore } from "@/lib/store";
import { staffPerformance } from "@/lib/selectors";

export default function ManagerStaffPage() {
  const data = useDemoStore((s) => s.data);
  const now = new Date();
  const perf = staffPerformance(data, "br_kakkanad", subDays(now, 30), now);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader title="Staff" description="Kakkanad team · last 30 days" />
      <StaffPerformanceList performance={perf} linkBase="/owner/staff" />
    </div>
  );
}
