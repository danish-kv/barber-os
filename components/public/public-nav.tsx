"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Scissors, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Explore shops", href: "/explore" },
  { label: "Demo", href: "/demo" },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75 safe-top">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar text-sidebar-primary">
            <Scissors className="size-4.5" aria-hidden />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Barbershop OS
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href as "/"}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === l.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/demo">Try the demo</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t bg-background px-4 py-3 md:hidden">
          <ul className="grid gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href as "/"}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button asChild>
                <Link href="/demo" onClick={() => setOpen(false)}>
                  Try the demo
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
