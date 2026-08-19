import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  Building2,
  CalendarCheck,
  Check,
  Gift,
  IndianRupee,
  ListChecks,
  Package,
  Scissors,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every capability of Barbershop OS — bookings, queue, CRM, POS, staff, inventory, marketing and analytics.",
};

const GROUPS = [
  {
    title: "Front of house",
    features: [
      {
        icon: CalendarCheck,
        name: "Smart bookings",
        points: [
          "Availability computed from real schedules, durations, breaks and leave",
          "Multiple services per visit with accurate total time",
          "\"Any barber\" fastest-chair matching",
          "Waitlist when slots are full, auto-notified on cancellations",
          "₹100 advance, full prepay, or pay-at-shop",
        ],
      },
      {
        icon: ListChecks,
        name: "Walk-in queue",
        points: [
          "One live queue for walk-ins and checked-in bookings",
          "Wait estimates simulated from current chair activity — realistic, not fixed",
          "Customer-facing live queue position",
          "One-tap assign, start, complete, no-show",
        ],
      },
      {
        icon: IndianRupee,
        name: "POS & payments",
        points: [
          "Services, add-ons and retail products in one basket",
          "UPI, cash, card, wallet and split payments",
          "Advance auto-adjust, tips, loyalty redemption",
          "Beautiful receipts, daily register closing",
        ],
      },
    ],
  },
  {
    title: "People",
    features: [
      {
        icon: Users,
        name: "Customer CRM",
        points: [
          "Preferences (\"low fade, beard 2mm\") visible to the barber in-chair",
          "Visit history, lifetime spend, no-show record",
          "Segments: new, VIP, loyal, at-risk, inactive",
          "Barber notes that persist across visits",
        ],
      },
      {
        icon: Scissors,
        name: "Staff management",
        points: [
          "Weekly shift schedule with breaks, leave and overtime",
          "Leave requests with manager approval — calendar reflects instantly",
          "Per-category commission rules per staff member",
          "Ratings, utilization and revenue per barber",
        ],
      },
      {
        icon: Gift,
        name: "Loyalty & memberships",
        points: [
          "Points on every rupee, redeemable in ₹100 rewards",
          "Visit streaks and tiers",
          "Monthly grooming memberships with included services",
          "Usage tracking (2/4 haircuts used) at POS automatically",
        ],
      },
    ],
  },
  {
    title: "Back office",
    features: [
      {
        icon: Package,
        name: "Inventory",
        points: [
          "Consumables deplete automatically as services complete",
          "Low-stock alerts with vendor lead times",
          "Purchase orders: draft → ordered → received, stock updates on receipt",
          "Retail products flow straight into the POS basket",
        ],
      },
      {
        icon: BarChart3,
        name: "Analytics & insights",
        points: [
          "Revenue by day, branch, staff and service",
          "Online vs walk-in mix, cancellation and no-show rates",
          "Busiest hours heat view, utilization by chair",
          "Deterministic insights: win-back value, gap-filling, peak staffing",
        ],
      },
      {
        icon: BadgePercent,
        name: "Marketing",
        points: [
          "Offer templates: first visit, Onam, Vishu, Eid, student, off-peak",
          "Segmented campaigns with estimated reach, cost and revenue",
          "WhatsApp-first message previews (simulated in demo)",
        ],
      },
      {
        icon: Building2,
        name: "Multi-branch",
        points: [
          "All-branch rollups with per-branch drill-down",
          "Branch manager role with scoped permissions",
          "Branch-level staff, inventory and expenses",
        ],
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6 lg:py-16">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Every tool a modern shop needs
        </h1>
        <p className="mt-3 text-muted-foreground">
          Built around how Kerala barbershops actually run — walk-ins and
          appointments together, UPI at the counter, WhatsApp in every pocket.
        </p>
      </div>

      {GROUPS.map((group) => (
        <section key={group.title} className="mt-12">
          <h2 className="text-xs font-semibold tracking-widest text-primary uppercase">
            {group.title}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.features.map((f) => (
              <div key={f.name} className="rounded-2xl border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-heading text-base font-semibold">{f.name}</h3>
                </div>
                <ul className="mt-4 grid gap-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-14 flex flex-col items-center rounded-2xl border bg-sidebar p-8 text-center">
        <Sparkles className="size-8 text-sidebar-primary" aria-hidden />
        <h2 className="mt-3 font-heading text-2xl font-semibold text-sidebar-accent-foreground">
          See it all working together
        </h2>
        <p className="mt-2 max-w-md text-sm text-sidebar-foreground/80">
          The demo is one connected shop — everything above is live and clickable.
        </p>
        <Button variant="secondary" size="lg" className="mt-6" asChild>
          <Link href="/demo">
            Explore the demo
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
