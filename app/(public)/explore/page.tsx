import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { BRANCHES, BUSINESS } from "@/lib/data/seed-static";

export const metadata: Metadata = {
  title: "Explore Shops",
  description: "Barbershops and salons on Barbershop OS across Kerala.",
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Shops on Barbershop OS
      </h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Every shop gets a public page like these — bookable from WhatsApp, ranked
        on Google, no app install required.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {BRANCHES.map((branch) => (
          <Link
            key={branch.id}
            href={`/shops/${BUSINESS.slug}?branch=${branch.slug}` as "/"}
            className="group overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-32 items-end bg-linear-to-br from-sidebar via-sidebar to-sidebar-accent p-5">
              <div>
                <p className="font-heading text-xl font-semibold text-sidebar-accent-foreground">
                  {BUSINESS.name}
                </p>
                <p className="text-sm text-sidebar-foreground/80">{branch.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden />
                  {branch.address.line1}, {branch.address.city}
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm">
                  <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                  <span className="font-medium">{BUSINESS.ratingAverage}</span>
                  <span className="text-muted-foreground">
                    ({BUSINESS.ratingCount.toLocaleString("en-IN")})
                  </span>
                </p>
              </div>
              <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform group-hover:scale-105">
                Book
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-10 rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">
        Your shop could be here.{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create your page free
        </Link>
      </p>
    </div>
  );
}
