// Decorative product previews for the landing page, built from the same
// design tokens as the real app so they stay truthful to the product.
// Purely presentational — marked aria-hidden by consumers where appropriate.

import { Scissors, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SPARK_POINTS =
  "0,54 20,50 40,44 60,47 80,38 100,40 120,30 140,33 160,24 180,27 200,16 220,20 240,10";

export function OwnerDashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10",
        className
      )}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="ml-3 rounded-md bg-background px-3 py-1 text-[10px] text-muted-foreground">
          royalcuts.barbershop-os.in/owner
        </span>
      </div>
      <div className="flex">
        {/* mini sidebar */}
        <div className="hidden w-36 shrink-0 flex-col gap-1 bg-sidebar p-3 sm:flex">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-primary">
              <Scissors className="size-3" />
            </span>
            <span className="text-[11px] font-semibold text-sidebar-accent-foreground">
              Royal Cuts
            </span>
          </div>
          {["Home", "Calendar", "Queue", "Customers", "Staff", "Inventory", "Analytics"].map(
            (item, i) => (
              <div
                key={item}
                className={cn(
                  "rounded-md px-2 py-1.5 text-[10px] font-medium",
                  i === 0
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70"
                )}
              >
                {item}
              </div>
            )
          )}
        </div>
        {/* content */}
        <div className="min-w-0 flex-1 space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Today · All branches</p>
              <p className="font-heading text-sm font-semibold">Good evening, Vikram</p>
            </div>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-medium text-success">
              Live
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Revenue", value: "₹18,420", delta: "+12.4%" },
              { label: "Appointments", value: "47", delta: "+8%" },
              { label: "Avg Ticket", value: "₹412", delta: "+3.1%" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border bg-background p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase">{m.label}</p>
                <p className="font-heading text-sm font-semibold">{m.value}</p>
                <p className="text-[9px] font-medium text-success">{m.delta}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-3 rounded-lg border bg-background p-2.5">
              <p className="text-[10px] font-medium">Revenue trend</p>
              <svg
                viewBox="0 0 240 60"
                className="mt-1 h-14 w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                <polyline
                  points={SPARK_POINTS}
                  fill="none"
                  stroke="var(--chart-1)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points={`${SPARK_POINTS} 240,60 0,60`}
                  fill="var(--chart-1)"
                  opacity="0.08"
                />
              </svg>
            </div>
            <div className="col-span-2 space-y-1.5 rounded-lg border bg-background p-2.5">
              <p className="text-[10px] font-medium">Live shop</p>
              {[
                { name: "Akhil", state: "Serving", tone: "text-success" },
                { name: "Nikhil", state: "Available", tone: "text-info" },
                { name: "Rahul", state: "Break", tone: "text-warning-foreground dark:text-warning" },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-[10px]">{s.name}</span>
                  <span className={cn("text-[9px] font-medium", s.tone)}>{s.state}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium">Queue · 3 waiting</p>
              <span className="text-[9px] text-muted-foreground">~14 min avg wait</span>
            </div>
            <div className="mt-1.5 flex gap-1.5">
              {["Shafi · Any", "Arjun · Akhil", "Neeraj · Nikhil"].map((q) => (
                <span
                  key={q}
                  className="rounded-full bg-muted px-2 py-0.5 text-[9px] text-muted-foreground"
                >
                  {q}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingPhonePreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-[290px] overflow-hidden rounded-[2rem] border-4 border-sidebar bg-background shadow-2xl shadow-primary/10",
        className
      )}
    >
      <div className="flex items-center justify-center bg-sidebar py-1.5">
        <span className="h-1 w-16 rounded-full bg-sidebar-accent" />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-[10px] text-muted-foreground">Royal Cuts · Kakkanad</p>
          <p className="font-heading text-sm font-semibold">Choose time</p>
        </div>
        <div className="flex gap-1.5">
          {[
            { d: "MON", n: "17" },
            { d: "TUE", n: "18", active: true },
            { d: "WED", n: "19" },
            { d: "THU", n: "20" },
            { d: "FRI", n: "21" },
          ].map((day) => (
            <div
              key={day.n}
              className={cn(
                "flex flex-1 flex-col items-center rounded-xl border py-2",
                day.active && "border-primary bg-primary text-primary-foreground"
              )}
            >
              <span className="text-[8px] opacity-80">{day.d}</span>
              <span className="text-xs font-semibold">{day.n}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">Evening</p>
          <div className="grid grid-cols-3 gap-1.5">
            {["5:30", "6:15", "7:00", "7:30", "8:00"].map((t2, i) => (
              <span
                key={t2}
                className={cn(
                  "rounded-lg border py-1.5 text-center text-[10px] font-medium",
                  i === 0 && "border-primary bg-primary/10 text-primary"
                )}
              >
                {t2} PM
              </span>
            ))}
            <span className="rounded-lg border border-dashed py-1.5 text-center text-[10px] text-muted-foreground">
              Waitlist
            </span>
          </div>
        </div>
        <div className="rounded-xl border bg-muted/40 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium">Haircut + Beard</p>
              <p className="text-[9px] text-muted-foreground">Akhil · 45 min</p>
            </div>
            <p className="font-heading text-sm font-semibold">₹350</p>
          </div>
        </div>
        <div className="rounded-xl bg-primary py-2.5 text-center text-xs font-semibold text-primary-foreground">
          Pay ₹100 advance · Book
        </div>
      </div>
    </div>
  );
}

export function QueuePreview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2.5 rounded-2xl border bg-card p-4 shadow-lg", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Now Serving
        </p>
        <span className="flex items-center gap-1 text-[10px] font-medium text-success">
          <span className="size-1.5 animate-pulse rounded-full bg-success" /> Live
        </span>
      </div>
      {[
        { barber: "Akhil", customer: "Danish", service: "Haircut + Beard", left: "18 min left" },
        { barber: "Nikhil", customer: "Rahul", service: "Haircut", left: "12 min left" },
      ].map((row) => (
        <div key={row.barber} className="flex items-center gap-3 rounded-xl border bg-background p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-success/10 text-xs font-semibold text-success">
            {row.barber[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {row.customer} <span className="text-muted-foreground">with {row.barber}</span>
            </p>
            <p className="text-xs text-muted-foreground">{row.service}</p>
          </div>
          <span className="text-xs font-medium text-success">{row.left}</span>
        </div>
      ))}
      <p className="pt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Waiting
      </p>
      {[
        { n: 1, name: "Shafi", pref: "Any Barber", wait: "8 min" },
        { n: 2, name: "Arjun", pref: "Akhil", wait: "25 min" },
        { n: 3, name: "Neeraj", pref: "Nikhil", wait: "18 min" },
      ].map((row) => (
        <div key={row.n} className="flex items-center gap-3 rounded-xl border bg-background p-3">
          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {row.n}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.pref}</p>
          </div>
          <span className="text-xs text-muted-foreground">est. {row.wait}</span>
        </div>
      ))}
    </div>
  );
}

export function ReviewPreview({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-4 shadow-lg", className)}>
      <div className="flex items-center gap-3">
        <span className="font-heading text-3xl font-semibold">4.8</span>
        <div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="size-3.5 fill-warning text-warning" aria-hidden />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">1,284 reviews</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          ["Service", 4.9],
          ["Cleanliness", 4.8],
          ["Wait time", 4.5],
          ["Staff", 4.9],
        ].map(([label, v]) => (
          <div key={label as string} className="flex items-center gap-2">
            <span className="w-20 text-xs text-muted-foreground">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-warning"
                style={{ width: `${((v as number) / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
