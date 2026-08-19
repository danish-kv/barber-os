"use client";

// Demo business switcher (Demo V1.1 §5/§43). Four archetypes prove one
// product scales from a single chair to multiple branches. Solo/small enter
// the unified /shop app directly; premium keeps the six-persona picker.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Scissors,
  Store,
  Users,
} from "lucide-react";
import { DemoRoleCards } from "@/components/public/demo-role-cards";
import { useDemoStore } from "@/lib/store";
import { useHydrated } from "@/lib/demo-provider";
import type { ScenarioId } from "@/lib/types";
import { cn } from "@/lib/utils";

type ArchetypeId = "solo" | "small" | "premium" | "multi";

const ARCHETYPES: Array<{
  id: ArchetypeId;
  scenario: ScenarioId;
  icon: typeof Scissors;
  title: string;
  shop: string;
  place: string;
  desc: string;
}> = [
  {
    id: "solo",
    scenario: "solo",
    icon: Scissors,
    title: "Solo barber",
    shop: "Danish Men's Studio",
    place: "Muvattupuzha",
    desc: "One chair, one phone. Bookings by call, walk-ins, simple daily revenue.",
  },
  {
    id: "small",
    scenario: "small",
    icon: Users,
    title: "Small shop",
    shop: "Brothers Hair Point",
    place: "Perumbavoor",
    desc: "Owner cuts too. One permanent barber + a temporary Onam-rush hire.",
  },
  {
    id: "premium",
    scenario: "premium",
    icon: Store,
    title: "Premium salon",
    shop: "Royal Cuts",
    place: "Kochi · Kakkanad",
    desc: "Online booking, receptionist, memberships — the full six-role demo.",
  },
  {
    id: "multi",
    scenario: "premium",
    icon: Building2,
    title: "Multi-branch",
    shop: "Royal Cuts",
    place: "4 branches, Kerala",
    desc: "Owner view across every branch: compare revenue, staff, inventory.",
  },
];

export function DemoScenarioPicker() {
  const router = useRouter();
  const hydrated = useHydrated();
  const storeScenario = useDemoStore((s) => s.session.scenario);
  const setScenario = useDemoStore((s) => s.setScenario);
  const enterRole = useDemoStore((s) => s.enterRole);
  const setActiveBranch = useDemoStore((s) => s.setActiveBranch);

  const [selected, setSelected] = useState<ArchetypeId | null>(null);
  // Until a card is tapped, reflect whatever scenario the store already holds.
  const active: ArchetypeId =
    selected ?? (storeScenario === "premium" ? "premium" : storeScenario);
  const archetype = ARCHETYPES.find((a) => a.id === active)!;

  const pick = (a: (typeof ARCHETYPES)[number]) => {
    setSelected(a.id);
    setScenario(a.scenario);
  };

  const enterShop = () => {
    toast.success(`Welcome to ${archetype.shop}`, {
      description: "Owner · Barber — everything in one app.",
    });
    router.push("/shop");
  };

  const enterMultiOwner = () => {
    enterRole("owner");
    setActiveBranch("all");
    toast.success("Welcome, Faizal Rahman", {
      description: "Owner · all 4 branches",
    });
    router.push("/owner" as "/");
  };

  return (
    <div className="space-y-8">
      {/* Business switcher */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ARCHETYPES.map((a) => {
          const isActive = hydrated && active === a.id;
          return (
            <button
              key={a.id}
              onClick={() => pick(a)}
              aria-pressed={isActive}
              className={cn(
                "flex flex-col items-start rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isActive && "border-primary bg-primary/5 ring-1 ring-primary"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  isActive ? "bg-primary/10" : "bg-muted"
                )}
              >
                <a.icon
                  className={cn(
                    "size-4.5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  aria-hidden
                />
              </span>
              <span className="mt-2.5 text-sm font-semibold">{a.title}</span>
              <span className="text-xs font-medium text-primary">
                {a.shop}
              </span>
              <span className="text-[11px] text-muted-foreground">{a.place}</span>
              <span className="mt-1.5 text-xs text-muted-foreground">{a.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Adaptive entry section */}
      {!hydrated ? null : active === "solo" || active === "small" ? (
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">
            {archetype.shop}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {archetype.place}
            </span>
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            {active === "solo"
              ? "No receptionist, no dashboard maze. Danish runs the whole shop — appointments, queue, checkout, earnings — from one phone app."
              : "Danish owns the shop and cuts hair. Sameer is permanent; Nabeel joined for the Onam rush on a temporary contract, managed without his own login."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={enterShop}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Enter as Danish — Owner · Barber
              <ArrowRight className="size-4" aria-hidden />
            </button>
            <button
              onClick={() =>
                router.push(
                  (active === "solo"
                    ? "/shops/danish-mens-studio"
                    : "/shops/brothers-hair-point") as "/"
                )
              }
              className="inline-flex min-h-11 items-center rounded-xl border px-5 text-sm font-medium transition-colors hover:bg-muted/60"
            >
              View the shop&apos;s public page
            </button>
          </div>
        </div>
      ) : active === "multi" ? (
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">
            Royal Cuts — every branch at once
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            The owner console with the branch filter set to all four branches:
            Kakkanad, Fort Kochi, Edappally and Vyttila compared side by side.
          </p>
          <button
            onClick={enterMultiOwner}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Enter as Faizal — Owner, all branches
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <div>
          <h2 className="mb-1 font-heading text-lg font-semibold">
            Pick a seat in the shop
          </h2>
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            One connected shop — actions carry across roles: book as the
            customer, check in at reception, cut as the barber, collect at the
            POS, and watch the owner&apos;s numbers move.
          </p>
          <DemoRoleCards />
        </div>
      )}
    </div>
  );
}
