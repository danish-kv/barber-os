"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { PERSONAS, ROLE_ORDER } from "@/lib/personas";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<Role, string> = {
  customer: "Customer",
  barber: "Barber",
  receptionist: "Receptionist",
  manager: "Branch Manager",
  owner: "Shop Owner",
  admin: "Platform Admin",
};

export function DemoRoleCards({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const enterRole = useDemoStore((s) => s.enterRole);

  const enter = (role: Role) => {
    enterRole(role);
    const p = PERSONAS[role];
    toast.success(`Welcome, ${p.name}`, { description: p.title });
    router.push(p.home as "/");
  };

  return (
    <div
      className={cn(
        "grid gap-3",
        compact
          ? "sm:grid-cols-2"
          : "sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {ROLE_ORDER.map((role) => {
        const p = PERSONAS[role];
        return (
          <button
            key={role}
            onClick={() => enter(role)}
            className="group flex flex-col items-start rounded-2xl border bg-card p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="flex w-full items-center gap-3">
              <ToneAvatar name={p.name} toneName={p.avatarTone} size="lg" />
              <div className="min-w-0">
                <h3 className="font-heading text-base font-semibold">
                  {ROLE_LABEL[role]}
                </h3>
                <p className="truncate text-xs text-muted-foreground">
                  {p.name}
                  {role !== "admin" ? ` · ${p.title.split("·")[0].trim()}` : ""}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              {p.cta}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
