"use client";

import { subDays } from "date-fns";
import { Clock, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { useDemoStore } from "@/lib/store";
import { servicePopularity } from "@/lib/selectors";
import { SERVICES, ADDONS } from "@/lib/data/seed-static";
import { durationLabel, inr } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  hair: "Hair",
  beard: "Beard",
  spa: "Spa & Relax",
  color: "Colour",
  kids: "Kids",
  styling: "Styling",
};

export default function OwnerServicesPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const now = new Date();
  const pop = servicePopularity(data, branchFilter, subDays(now, 30), now);
  const statFor = (id: string) => pop.find((p) => p.serviceId === id);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Services"
        description={`${SERVICES.length} services · ${ADDONS.length} add-ons`}
        actions={
          <Button
            size="sm"
            onClick={() =>
              toast("Add service", {
                description: "Service editor ships with the catalog module — demo catalog is seeded.",
              })
            }
          >
            <Plus className="size-4" aria-hidden />
            New service
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {SERVICES.map((svc) => {
          const stat = statFor(svc.id);
          return (
            <div key={svc.id} className="rounded-2xl border bg-card p-4 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {svc.name}
                    {svc.popular && (
                      <span className="flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-accent-foreground">
                        <Sparkles className="size-2.5" aria-hidden />
                        POPULAR
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABEL[svc.category]}
                    {svc.requiresResourceType && ` · needs ${svc.requiresResourceType}`}
                  </p>
                </div>
                <p className="shrink-0 font-heading text-lg font-semibold tabular-nums">
                  {inr(svc.price)}
                </p>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                {svc.description}
              </p>
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3" aria-hidden />
                  {durationLabel(svc.durationMin)}
                </span>
                <span className="text-muted-foreground">
                  {stat
                    ? `${stat.bookings}× · ${inr(stat.revenue, { compact: true })} (30d)`
                    : "No bookings (30d)"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Add-ons
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {ADDONS.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <span>
                <span className="block text-sm font-medium">{a.name}</span>
                <span className="block text-xs text-muted-foreground">
                  +{durationLabel(a.durationMin)}
                </span>
              </span>
              <span className="font-medium tabular-nums">{inr(a.price)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
