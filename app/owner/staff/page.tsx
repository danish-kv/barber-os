"use client";

import { subDays } from "date-fns";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StaffPerformanceList } from "@/components/staff/staff-performance-list";
import { useDemoStore } from "@/lib/store";
import { staffPerformance } from "@/lib/selectors";

export default function OwnerStaffPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const now = new Date();
  const perf = staffPerformance(data, branchFilter, subDays(now, 30), now);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Staff"
        description="Performance over the last 30 days"
        actions={
          <Button
            size="sm"
            onClick={() =>
              toast("Add staff", {
                description:
                  "The staff onboarding form ships with the roster module — demo staff are seeded.",
              })
            }
          >
            <UserPlus className="size-4" aria-hidden />
            Add staff
          </Button>
        }
      />
      <StaffPerformanceList performance={perf} linkBase="/owner/staff" />
    </div>
  );
}
