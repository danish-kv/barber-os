import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types";

const STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; className: string; dot: string }
> = {
  waitlisted: {
    label: "Waitlisted",
    className: "bg-secondary text-secondary-foreground",
    dot: "bg-muted-foreground",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-info/10 text-info dark:bg-info/15",
    dot: "bg-info",
  },
  "checked-in": {
    label: "Checked In",
    className: "bg-accent text-accent-foreground",
    dot: "bg-accent-foreground",
  },
  waiting: {
    label: "Waiting",
    className: "bg-warning/15 text-warning-foreground dark:text-warning",
    dot: "bg-warning",
  },
  "in-service": {
    label: "In Service",
    className: "bg-success/10 text-success dark:bg-success/15",
    dot: "bg-success animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success dark:bg-success/15",
    dot: "bg-success",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "no-show": {
    label: "No Show",
    className: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        s.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
