"use client";

import Link from "next/link";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { branchById, serviceNames, staffById } from "@/lib/selectors";
import { dateTimeLabel, inr } from "@/lib/format";
import { priceForSelection } from "@/lib/store";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CustomerAppointmentCard({
  appointment,
  highlight = false,
}: {
  appointment: Appointment;
  highlight?: boolean;
}) {
  const staff = staffById(appointment.staffId);
  const branch = branchById(appointment.branchId);
  const price = priceForSelection(appointment.serviceIds, appointment.addonIds);

  return (
    <Link
      href={`/customer/bookings/${appointment.id}` as "/"}
      className={cn(
        "block rounded-2xl border bg-card p-4 shadow-xs transition-all hover:shadow-md active:scale-[0.995]",
        highlight && "border-primary/40 bg-linear-to-br from-primary/5 to-transparent"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {dateTimeLabel(appointment.start)}
        </p>
        <StatusBadge status={appointment.status} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        {staff ? (
          <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="md" />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            Any
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {serviceNames(appointment.serviceIds)}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {staff ? `${staff.name} · ` : ""}
            <MapPin className="size-3" aria-hidden />
            {branch?.name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="font-heading text-sm font-semibold">{inr(price)}</span>
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </div>
      </div>
      {appointment.status === "waiting" && appointment.estimatedWaitMin !== undefined && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-warning-foreground dark:text-warning">
          <Clock className="size-3.5" aria-hidden />
          In queue · estimated wait {appointment.estimatedWaitMin} min
        </p>
      )}
    </Link>
  );
}
