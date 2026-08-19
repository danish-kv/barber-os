import Link from "next/link";
import { Scissors } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Live demo", href: "/demo" },
      { label: "Onboarding", href: "/onboarding" },
    ],
  },
  {
    title: "For shops",
    links: [
      { label: "Bookings", href: "/features" },
      { label: "Walk-in queue", href: "/features" },
      { label: "Analytics", href: "/features" },
      { label: "Marketing", href: "/features" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Royal Cuts, Kakkanad", href: "/shops/royal-cuts" },
      { label: "All shops", href: "/explore" },
      { label: "Book online", href: "/shops/royal-cuts/book" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-primary">
              <Scissors className="size-4.5" aria-hidden />
            </span>
            <span className="font-heading text-lg font-semibold text-sidebar-accent-foreground">
              Barbershop OS
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-sidebar-foreground/70">
            The operating system for modern barbershops and salons — built for
            Kerala, ready for the world.
          </p>
          <p className="mt-6 text-xs text-sidebar-foreground/50">
            Demo environment — all shops, people and transactions are simulated.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-xs font-semibold tracking-widest text-sidebar-foreground/60 uppercase">
              {col.title}
            </h3>
            <ul className="mt-3 grid gap-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href as "/"}
                    className="text-sm text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-sidebar-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-sidebar-foreground/50 lg:px-6">
          <span>© 2026 Barbershop OS. Made in Kochi.</span>
          <span>English · മലയാളം</span>
        </div>
      </div>
    </footer>
  );
}
