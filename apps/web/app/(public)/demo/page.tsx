import type { Metadata } from "next";
import { DemoRoleCards } from "@/components/public/demo-role-cards";
import { FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Demo",
  description:
    "Enter the Barbershop OS demo as a customer, barber, receptionist, manager, owner or platform admin.",
};

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6 lg:py-16">
      <p className="inline-flex items-center gap-2 rounded-full border border-dashed border-primary/40 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
        <FlaskConical className="size-3.5" aria-hidden />
        Demo environment — all data is simulated
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Pick a seat in the shop
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        This is one connected demo shop — <strong>Royal Cuts, Kochi</strong>.
        Actions carry across roles: book as the customer, check them in at
        reception, cut as the barber, collect at the POS, and watch the
        owner&apos;s numbers move. Switch roles anytime from the avatar menu.
      </p>
      <div className="mt-8">
        <DemoRoleCards />
      </div>
      <div className="mt-10 rounded-2xl border bg-muted/40 p-5">
        <h2 className="font-heading text-base font-semibold">
          Suggested 5-minute storyline
        </h2>
        <ol className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>1 · Customer books Haircut + Beard with Akhil, pays ₹100 advance</li>
          <li>2 · Receptionist checks the customer in — queue updates live</li>
          <li>3 · Barber starts, notes preferences, completes the service</li>
          <li>4 · Receptionist checks out with UPI — loyalty points land</li>
          <li>5 · Owner dashboard shows the revenue, ticket and utilization move</li>
          <li>6 · Reset demo data from the avatar menu and run it again</li>
        </ol>
      </div>
    </div>
  );
}
