"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DayCalendar } from "@/components/calendar/day-calendar";

export default function ManagerCalendarPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader title="Branch calendar" description="Kakkanad · all staff lanes" />
      <DayCalendar branchId="br_kakkanad" />
    </div>
  );
}
