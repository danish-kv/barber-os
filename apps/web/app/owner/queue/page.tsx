"use client";

import { format } from "date-fns";
import { Hourglass } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { QueueBoard } from "@/components/reception/queue-board";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { branchById, customerById, serviceNames, staffById } from "@/lib/selectors";

export default function OwnerQueuePage() {
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const data = useDemoStore((s) => s.data);
  const resolveWaitlist = useDemoStore((s) => s.resolveWaitlist);
  const branchId = branchFilter === "all" ? "br_kakkanad" : branchFilter;

  const waitlist = data.waitlist.filter(
    (w) => w.branchId === branchId && ["open", "notified"].includes(w.status)
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Queue"
        description={`${branchById(branchId)?.name} · live view`}
      />
      <QueueBoard branchId={branchId} posHrefBase="/reception/pos" />

      {/* Waitlist */}
      <section aria-label="Waitlist">
        <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          <Hourglass className="size-3.5" aria-hidden />
          Waitlist ({waitlist.length})
        </h2>
        {waitlist.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            No waitlisted customers. When a desired slot is full, customers can
            join the waitlist from the booking flow.
          </p>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {waitlist.map((w) => {
              const customer = customerById(data, w.customerId);
              const staff = staffById(w.staffId);
              return (
                <li
                  key={w.id}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3.5"
                >
                  {customer && (
                    <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="sm" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{customer?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {serviceNames(w.serviceIds)} · {staff?.name ?? "Any barber"} ·{" "}
                      {format(new Date(w.desiredDate), "EEE d MMM")} {w.desiredWindow}
                    </p>
                    {w.status === "notified" && (
                      <p className="text-[11px] font-medium text-success">
                        Notified — slot opened
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resolveWaitlist(w.id, "notified");
                      toast.success(`${customer?.name} notified (simulated)`, {
                        description: "They'll get a WhatsApp with a booking link.",
                      });
                    }}
                  >
                    Notify
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
