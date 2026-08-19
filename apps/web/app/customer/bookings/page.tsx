"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarX2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { CustomerAppointmentCard } from "@/components/customer/appointment-card";
import { useDemoStore } from "@/lib/store";
import {
  historyForCustomer,
  serviceNames,
  staffById,
  upcomingForCustomer,
} from "@/lib/selectors";
import { dayLabel } from "@/lib/format";

const CUSTOMER_ID = "cu_danish";

export default function CustomerBookingsPage() {
  const data = useDemoStore((s) => s.data);
  const [tab, setTab] = useState("upcoming");

  const upcoming = upcomingForCustomer(data, CUSTOMER_ID);
  const history = historyForCustomer(data, CUSTOMER_ID);
  const lastCompleted = history.find((a) => a.status === "completed");

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Bookings</h1>

      {lastCompleted && (
        <div className="flex items-center gap-3 rounded-2xl border bg-accent/40 p-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <RotateCcw className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Book this again</p>
            <p className="truncate text-xs text-muted-foreground">
              {serviceNames(lastCompleted.serviceIds)} ·{" "}
              {staffById(lastCompleted.staffId)?.name} · Last visit{" "}
              {dayLabel(lastCompleted.start)}
            </p>
          </div>
          <Button size="sm" asChild>
            <Link
              href={
                `/shops/royal-cuts/book?services=${lastCompleted.serviceIds.join(",")}&staff=${lastCompleted.staffId ?? ""}` as "/"
              }
            >
              Rebook
            </Link>
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past ({history.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "upcoming" ? (
        upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title="No upcoming bookings"
            description="Book your next visit — your favorite slot fills up fast on weekends."
            actionLabel="Book now"
            actionHref="/shops/royal-cuts/book"
          />
        ) : (
          <div className="grid gap-3">
            {upcoming.map((a) => (
              <CustomerAppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        )
      ) : history.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="No past visits yet"
          description="Your visit history will appear here."
        />
      ) : (
        <div className="grid gap-3">
          {history.map((a) => (
            <CustomerAppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
