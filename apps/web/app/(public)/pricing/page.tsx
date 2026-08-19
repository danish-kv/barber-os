import type { Metadata } from "next";
import Link from "next/link";
import { Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SUBSCRIPTION_PLANS } from "@/lib/data/seed-static";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Barbershop OS plans — Free, Pro ₹799, Business ₹1,499 and Multi-Branch ₹2,999+.",
};

const COMPARE: Array<{ label: string; values: [boolean | string, boolean | string, boolean | string, boolean | string] }> = [
  { label: "Online bookings", values: ["Basic", true, true, true] },
  { label: "Staff members", values: ["1", "Unlimited", "Unlimited", "Unlimited"] },
  { label: "Walk-in queue", values: [false, true, true, true] },
  { label: "POS & UPI payments", values: [false, true, true, true] },
  { label: "Customer database", values: [true, true, true, true] },
  { label: "Analytics", values: [false, "Core", "Advanced", "Advanced"] },
  { label: "Loyalty & memberships", values: [false, false, true, true] },
  { label: "Inventory & purchase orders", values: [false, false, true, true] },
  { label: "Staff commissions", values: [false, false, true, true] },
  { label: "Marketing campaigns", values: [false, false, true, true] },
  { label: "Multiple branches", values: [false, false, false, true] },
  { label: "Centralized analytics", values: [false, false, false, true] },
  { label: "Priority support", values: [false, false, false, true] },
];

const FAQS = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes — upgrades apply immediately, downgrades at the next billing cycle. Your data is never lost when switching.",
  },
  {
    q: "Is there a setup fee?",
    a: "No. Onboarding takes under an hour and our wizard walks you through services, staff and hours.",
  },
  {
    q: "How does the free plan work?",
    a: "Free forever for one barber with basic bookings and a customer database. Perfect for a single-chair shop testing the waters.",
  },
  {
    q: "Do you charge per booking?",
    a: "No commissions and no per-booking fees on any plan. The monthly price is everything.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple pricing, no commissions
        </h1>
        <p className="mt-3 text-muted-foreground">
          No per-booking fees. No hidden charges. Cancel anytime.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-6 shadow-xs",
              plan.highlight && "border-primary shadow-lg shadow-primary/10"
            )}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                Most popular
              </span>
            )}
            <h2 className="font-heading text-lg font-semibold">{plan.name}</h2>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="font-heading text-3xl font-semibold">
                ₹{plan.pricePerMonth.toLocaleString("en-IN")}
                {plan.priceSuffix ?? ""}
              </span>
              <span className="text-sm text-muted-foreground">/month</span>
            </p>
            <ul className="mt-5 grid flex-1 gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant={plan.highlight ? "default" : "outline"} className="mt-6" asChild>
              <Link href="/register">
                {plan.pricePerMonth === 0 ? "Start free" : "Start 14-day trial"}
              </Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Comparison — cards on mobile, table on desktop */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Compare plans
        </h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[640px] border-collapse bg-card text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th scope="col" className="p-3 text-left font-medium">Feature</th>
                {SUBSCRIPTION_PLANS.map((p) => (
                  <th key={p.id} scope="col" className="p-3 text-center font-medium">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <th scope="row" className="p-3 text-left font-normal text-muted-foreground">
                    {row.label}
                  </th>
                  {row.values.map((v, i) => (
                    <td key={i} className="p-3 text-center">
                      {v === true ? (
                        <Check className="mx-auto size-4 text-success" aria-label="Included" />
                      ) : v === false ? (
                        <span className="text-muted-foreground/40" aria-label="Not included">
                          —
                        </span>
                      ) : (
                        <span className="text-xs font-medium">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-3xl">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-muted-foreground" aria-hidden />
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Pricing questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-4">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
