"use client";

import { Armchair, DoorOpen, ShowerHead } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useDemoStore } from "@/lib/store";
import { queueForBranch, branchById } from "@/lib/selectors";
import { RESOURCES, BRANCHES } from "@/lib/data/seed-static";
import { cn } from "@/lib/utils";

const TYPE_ICON = { chair: Armchair, room: DoorOpen, station: ShowerHead } as const;

export default function OwnerResourcesPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const branches =
    branchFilter === "all" ? BRANCHES : BRANCHES.filter((b) => b.id === branchFilter);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Resources"
        description="Chairs, rooms and stations — services can require a resource type, so scheduling can grow beyond staff availability"
      />

      {branches.map((branch) => {
        const queue = queueForBranch(data, branch.id);
        const servingCount = queue.serving.length;
        const resources = RESOURCES.filter((r) => r.branchId === branch.id);
        return (
          <section key={branch.id}>
            <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {branchById(branch.id)?.name}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {resources.map((res, i) => {
                const Icon = TYPE_ICON[res.type];
                // Chairs mirror live serving state; rooms/stations from seed status.
                const inUse = res.type === "chair" ? i < servingCount : false;
                return (
                  <div
                    key={res.id}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center",
                      inUse && "border-success/40 bg-success/5"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl",
                        inUse ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <p className="text-xs font-semibold">{res.name}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        inUse ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {inUse ? "In use" : "Available"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="text-xs text-muted-foreground">
        The Facial service requires a room; Hair Wash add-ons use a station. The
        scheduler reserves the resource along with the barber.
      </p>
    </div>
  );
}
