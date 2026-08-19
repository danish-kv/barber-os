import type { Metadata } from "next";
import { DemoScenarioPicker } from "@/components/public/demo-scenario-picker";
import { FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Demo",
  description:
    "Try Barbershop OS as a solo barber, a small local shop, a premium salon or a multi-branch business — all data simulated.",
};

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-6 lg:py-16">
      <p className="inline-flex items-center gap-2 rounded-full border border-dashed border-primary/40 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
        <FlaskConical className="size-3.5" aria-hidden />
        Demo environment — all data is simulated
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Choose a shop to try
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The same product runs a one-chair studio and a multi-branch chain.
        Pick the business that looks like yours — switching reseeds the demo
        for that shop.
      </p>
      <div className="mt-8">
        <DemoScenarioPicker />
      </div>
      <div className="mt-10 rounded-2xl border bg-muted/40 p-5">
        <h2 className="font-heading text-base font-semibold">
          Suggested 5-minute storylines
        </h2>
        <div className="mt-3 grid gap-5 text-sm text-muted-foreground md:grid-cols-2">
          <div>
            <h3 className="font-medium text-foreground">Local shop (Solo / Small)</h3>
            <ol className="mt-2 grid gap-1.5">
              <li>1 · A customer calls — add the appointment in under 20 seconds</li>
              <li>2 · A walk-in arrives — join the queue with a live wait time</li>
              <li>3 · Start the cut, finish, collect UPI at checkout</li>
              <li>4 · Business tab: today&apos;s revenue already moved</li>
              <li>5 · Onam rush? Add a temporary barber with an end date</li>
            </ol>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Premium salon</h3>
            <ol className="mt-2 grid gap-1.5">
              <li>1 · Customer books Haircut + Beard with Akhil, pays ₹100 advance</li>
              <li>2 · Receptionist checks the customer in — queue updates live</li>
              <li>3 · Barber starts, notes preferences, completes the service</li>
              <li>4 · Receptionist checks out with UPI — loyalty points land</li>
              <li>5 · Owner dashboard shows revenue and utilization move</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
