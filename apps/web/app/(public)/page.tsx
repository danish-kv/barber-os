import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Check,
  Gift,
  IndianRupee,
  Languages,
  ListChecks,
  MessageCircle,
  Package,
  Scissors,
  Smartphone,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DemoRoleCards } from "@/components/public/demo-role-cards";
import {
  BookingPhonePreview,
  OwnerDashboardPreview,
  QueuePreview,
  ReviewPreview,
} from "@/components/public/product-preview";
import { SUBSCRIPTION_PLANS } from "@/lib/data/seed-static";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Barbershop OS — The Operating System for Modern Barbershops",
  description:
    "Bookings, walk-ins, staff, customers, payments, inventory, marketing and analytics. Everything required to run a modern shop — built for Kerala.",
};

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Online bookings",
    body: "Real availability from staff schedules, service durations and breaks — not fake 30-minute grids.",
  },
  {
    icon: ListChecks,
    title: "Walk-in queue",
    body: "Live queue with smart wait estimates. Customers watch their place from their phone.",
  },
  {
    icon: Users,
    title: "Customer CRM",
    body: "Preferences, visit history, spend, notes — every barber knows every regular.",
  },
  {
    icon: Wallet,
    title: "POS & UPI payments",
    body: "Advance collection, split payments, membership redemptions and instant receipts.",
  },
  {
    icon: Scissors,
    title: "Staff & commissions",
    body: "Shifts, leave, per-service commission rules and transparent earnings for every chair.",
  },
  {
    icon: Package,
    title: "Inventory",
    body: "Consumables deplete with services. Low-stock alerts before you run out mid-shave.",
  },
  {
    icon: BadgePercent,
    title: "Offers & marketing",
    body: "Win-back campaigns, festival offers, WhatsApp-first promotions with estimated ROI.",
  },
  {
    icon: BarChart3,
    title: "Owner analytics",
    body: "Revenue, utilization, no-shows, staff performance — answers, not just charts.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Saturday chaos is gone. Customers book online, walk-ins see their wait time, and I see everything from my phone.",
    name: "Vikram Menon",
    title: "Owner, Royal Cuts — 4 branches, Kochi & TVM",
  },
  {
    quote:
      "My regulars book me directly now. I know who's next, what they want, and my commission updates the moment I finish.",
    name: "Akhil",
    title: "Senior Barber, Kakkanad",
  },
  {
    quote:
      "The win-back campaign paid for the software in one weekend. 27 customers came back with the ₹100 offer.",
    name: "Nisha T.",
    title: "Owner, Salon de Kerala — 5 branches",
  },
];

const FAQS = [
  {
    q: "Do my customers need to install an app?",
    a: "No. Booking, queue tracking and payments all run on the mobile web — customers tap a WhatsApp link or scan a QR at the counter and they're in. It also installs to the home screen like an app if they want it.",
  },
  {
    q: "Can it handle walk-ins and online bookings together?",
    a: "Yes — that's the core of the product. Walk-ins join the same live queue and calendar as online bookings, with realistic wait estimates based on who's in the chair right now.",
  },
  {
    q: "Does it work in Malayalam?",
    a: "Customer-facing screens — booking, confirmations, reminders — support English and മലയാളം. Staff can use whichever they prefer.",
  },
  {
    q: "How do staff commissions work?",
    a: "Set per-service-category rates per staff member (e.g. 30% on haircuts, 10% on product sales). Earnings update in real time as services complete, and payroll reports roll it up monthly.",
  },
  {
    q: "What about multiple branches?",
    a: "The Multi-Branch plan gives you centralized analytics with per-branch drill-down, branch-level managers, staff and inventory — all under one owner account.",
  },
  {
    q: "Is my data locked in?",
    a: "No. Customers, bookings and transaction history export to CSV anytime.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-clip">
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-accent/40 via-background to-background"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-16 lg:grid-cols-2 lg:px-6 lg:pt-24 lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Built for Kerala&apos;s barbershops & salons
            </p>
            <h1 className="mt-5 font-heading text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
              The Operating System for Modern Barbershops
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Bookings. Walk-ins. Staff. Customers. Payments. Inventory.
              Marketing. Analytics. Everything required to run a modern shop —
              in one place, on any phone.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild className="h-12 px-6 text-base">
                <Link href="/demo">
                  Explore the live demo
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base">
                <Link href="/shops/royal-cuts/book">Book as a customer</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-success" aria-hidden /> No app install
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-success" aria-hidden /> UPI-first payments
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-success" aria-hidden /> English · മലയാളം
              </span>
            </div>
          </div>
          <div aria-hidden className="relative mx-auto w-full max-w-xl">
            <OwnerDashboardPreview />
            <BookingPhonePreview className="absolute -right-2 -bottom-10 hidden scale-[0.62] shadow-2xl sm:block lg:-right-8" />
          </div>
        </div>
      </section>

      {/* --------------------------- DEMO ENTRY --------------------------- */}
      <section id="demo" className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Explore the demo
            </h2>
            <p className="mt-2 text-muted-foreground">
              One connected shop, six perspectives. Book as a customer, watch it
              land at reception, serve it as the barber, and see revenue move on
              the owner&apos;s dashboard. No passwords — just pick a seat.
            </p>
          </div>
          <div className="mt-8">
            <DemoRoleCards />
          </div>
        </div>
      </section>

      {/* ------------------------- SHOP ARCHETYPES ------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Built for the way your shop actually works
          </h2>
          <p className="mt-2 text-muted-foreground">
            From one chair to multiple branches — start simple and grow without
            switching systems. Take bookings by phone, online, or run pure
            walk-ins; the app follows your rules, not the other way around.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Solo barber", "One chair, one phone — bookings by call, walk-ins, daily revenue."],
              ["Small local shop", "You cut too. Add a seasonal barber for the Onam rush, no login needed."],
              ["Premium salon", "Online booking, receptionist, memberships, loyalty."],
              ["Multi-branch", "Every branch compared on one owner dashboard."],
            ] as const
          ).map(([title, body]) => (
            <Link
              key={title}
              href="/demo"
              className="group rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <h3 className="font-heading text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Try this shop
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------------- FEATURES ---------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Everything required to run a modern shop
          </h2>
          <p className="mt-2 text-muted-foreground">
            Replace the notebook, the wall calendar, the WhatsApp group and the
            calculator with one system your whole team actually enjoys using.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-heading text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------- BOOKING WORKFLOW ------------------------ */}
      <section className="border-y bg-sidebar text-sidebar-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-6 lg:py-24">
          <div>
            <p className="text-xs font-semibold tracking-widest text-sidebar-primary uppercase">
              Booking that respects reality
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-sidebar-accent-foreground">
              A booking flow customers finish in under a minute
            </h2>
            <p className="mt-3 text-sidebar-foreground/80">
              Services → barber → time → pay. Availability is computed from each
              barber&apos;s real schedule, service durations, breaks and leave —
              so a 90-minute hair colour never lands in a 30-minute gap.
            </p>
            <ul className="mt-6 grid gap-3">
              {[
                "\"Any barber\" mode finds the fastest chair",
                "₹100 advance, full payment, or pay at shop",
                "Full slots offer a one-tap waitlist",
                "Confirmations ready to share on WhatsApp",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-sidebar-foreground/90">
                  <Check className="mt-0.5 size-4 shrink-0 text-sidebar-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              className="mt-8"
              asChild
            >
              <Link href="/shops/royal-cuts/book">
                Try the booking flow
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <div aria-hidden className="mx-auto">
            <BookingPhonePreview />
          </div>
        </div>
      </section>

      {/* ------------------------------ QUEUE ------------------------------ */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-6 lg:py-24">
        <div aria-hidden className="order-2 lg:order-1">
          <QueuePreview className="mx-auto max-w-md" />
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Walk-ins, tamed
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
            A live queue everyone can trust
          </h2>
          <p className="mt-3 text-muted-foreground">
            Reception adds walk-ins in seconds. The queue calculates realistic
            waits from who&apos;s in each chair right now. Customers watch their
            position live instead of hovering by the door.
          </p>
          <ul className="mt-6 grid gap-3">
            {[
              "Preferred barber or first-available",
              "Online bookings and walk-ins share one timeline",
              "Barbers pull the next customer with one tap",
              "No-shows release capacity instantly",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------- ANALYTICS + CRM + EXTRAS -------------------- */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Run it like a business
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
              The owner&apos;s morning glance, sorted
            </h2>
            <p className="mt-2 text-muted-foreground">
              How much did we make? Who&apos;s working? What needs attention?
              One screen answers it — on your phone, before your first chai.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <span className="flex size-10 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
                <BarChart3 className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-heading text-base font-semibold">
                Insights, not just charts
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                &ldquo;127 customers haven&apos;t returned in 45+ days — a ₹100
                win-back could recover ≈₹18,000.&rdquo; The system finds the
                opportunity and drafts the campaign.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <span className="flex size-10 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2">
                <Gift className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-heading text-base font-semibold">
                Loyalty & memberships
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Points on every visit, streaks, and a ₹999/month grooming
                membership that keeps your best customers coming back monthly.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <span className="flex size-10 items-center justify-center rounded-xl bg-chart-5/10 text-chart-5">
                <MessageCircle className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-heading text-base font-semibold">
                WhatsApp-first
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Booking links, reminders and win-back offers designed for the
                app your customers already live in.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <span className="flex size-10 items-center justify-center rounded-xl bg-chart-4/15 text-chart-4">
                <IndianRupee className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-heading text-base font-semibold">UPI-native POS</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Advance adjust, split payments, tips, membership redemptions —
                and a receipt worth keeping.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Languages className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-heading text-base font-semibold">
                English · മലയാളം
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Customers book in the language they think in. Staff switch
                anytime.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <span className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info">
                <Smartphone className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-heading text-base font-semibold">
                Phone-first for everyone
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Barbers run their day from the phone in their pocket. Owners run
                the business from theirs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- TESTIMONIALS -------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Shops that switched, stayed
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="flex flex-col rounded-2xl border bg-card p-5 shadow-xs">
                  <div className="flex gap-0.5" aria-label="5 star rating">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="size-3.5 fill-warning text-warning" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-3 flex-1 text-sm">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div aria-hidden>
            <ReviewPreview />
          </div>
        </div>
      </section>

      {/* ----------------------------- PRICING ----------------------------- */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-24">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Pricing that scales with your chairs
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start free with one barber. Upgrade when the queue does.
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
                <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
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
                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className="mt-6"
                  asChild
                >
                  <Link href="/register">
                    {plan.pricePerMonth === 0 ? "Start free" : "Start 14-day trial"}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- FAQ ------------------------------- */}
      <section className="mx-auto max-w-3xl px-4 py-16 lg:px-6 lg:py-24">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          Questions, answered
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ---------------------------- FINAL CTA ---------------------------- */}
      <section className="border-t bg-sidebar">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center lg:py-24">
          <CalendarDays className="size-10 text-sidebar-primary" aria-hidden />
          <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance text-sidebar-accent-foreground sm:text-4xl">
            Your shop could be running on this by tomorrow morning
          </h2>
          <p className="mt-3 max-w-xl text-sidebar-foreground/80">
            Set up services, staff and hours in under an hour. Or walk through
            the full demo first — every role, every flow, no signup.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild className="h-12 px-6 text-base">
              <Link href="/demo">
                Explore the demo
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="h-12 bg-sidebar-primary px-6 text-base text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              <Link href="/onboarding">Set up your shop</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
