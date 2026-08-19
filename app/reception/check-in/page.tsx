"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ClipboardList, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import {
  appointmentsForDay,
  customerById,
  serviceNames,
  staffById,
} from "@/lib/selectors";
import { timeLabel } from "@/lib/format";

const BRANCH_ID = "br_kakkanad";

export default function ReceptionCheckInPage() {
  const data = useDemoStore((s) => s.data);
  const checkIn = useDemoStore((s) => s.checkIn);
  const [query, setQuery] = useState("");

  const todays = appointmentsForDay(data, BRANCH_ID, new Date());
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todays
      .filter((a) => ["confirmed", "waiting", "checked-in", "in-service"].includes(a.status))
      .filter((a) => {
        if (!q) return true;
        const c = customerById(data, a.customerId);
        return (
          c?.name.toLowerCase().includes(q) ||
          c?.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
        );
      });
  }, [todays, query, data]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Check-in"
        description="Find today's booking by name or phone"
      />

      <div className="relative">
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 rounded-full pl-10"
          autoFocus
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={query ? "No matching bookings" : "Nothing to check in"}
          description={
            query
              ? `No bookings today for "${query}".`
              : "Today's confirmed bookings appear here as customers arrive."
          }
        />
      ) : (
        <ul className="grid gap-2">
          {list.map((appt) => {
            const customer = customerById(data, appt.customerId);
            const staff = staffById(appt.staffId);
            return (
              <li
                key={appt.id}
                className="flex items-center gap-3 rounded-2xl border bg-card p-4"
              >
                <span className="w-16 shrink-0 text-sm font-semibold tabular-nums">
                  {timeLabel(appt.start)}
                </span>
                {customer && (
                  <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="sm" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{customer?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {serviceNames(appt.serviceIds)} · {staff ? staff.name : "Any barber"}
                    {appt.advancePaid && ` · ₹${appt.advanceAmount} advance`}
                  </p>
                </div>
                {appt.status === "confirmed" ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      checkIn(appt.id);
                      toast.success(`${customer?.name} checked in`);
                    }}
                  >
                    <Check className="size-4" aria-hidden />
                    Check in
                  </Button>
                ) : (
                  <StatusBadge status={appt.status} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
