"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DayCalendar } from "@/components/calendar/day-calendar";

export default function ReceptionCalendarPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Calendar"
        description="Online bookings and walk-ins on one timeline"
      />
      <DayCalendar branchId="br_kakkanad" />
    </div>
  );
}
