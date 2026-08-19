"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/shared/star-rating";
import { useDemoStore } from "@/lib/store";
import { BRANCHES, SERVICES } from "@/lib/data/seed-static";
import { availableSlotsAnyStaff } from "@/lib/availability";
import { inr } from "@/lib/format";
import { t } from "@/lib/i18n";

export default function CustomerExplorePage() {
  const data = useDemoStore((s) => s.data);
  const lang = useDemoStore((s) => s.session.language);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const branches = BRANCHES.filter(
      (b) =>
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.address.locality.toLowerCase().includes(q) ||
        "royal cuts".includes(q)
    );
    const services = SERVICES.filter((s) => q && s.name.toLowerCase().includes(q));
    return { branches, services };
  }, [query]);

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {t("home.explore", lang)}
      </h1>

      <div className="relative">
        <Search
          className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search services or shops…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 rounded-full pl-10"
        />
      </div>

      {results.services.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Services
          </h2>
          <div className="grid gap-2">
            {results.services.map((s) => (
              <Link
                key={s.id}
                href={`/shops/royal-cuts/book?services=${s.id}` as "/"}
                className="flex items-center justify-between rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <span>
                  <span className="block text-sm font-semibold">
                    {lang === "ml" && s.nameMl ? s.nameMl : s.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {s.durationMin} min
                  </span>
                </span>
                <span className="font-heading font-semibold">{inr(s.price)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Near you
        </h2>
        <div className="grid gap-3">
          {results.branches.map((branch, i) => {
            const todaySlots = availableSlotsAnyStaff(
              data,
              branch.id,
              new Date(),
              ["sv_haircut"]
            );
            const nextSlot = todaySlots[0];
            return (
              <Link
                key={branch.id}
                href={`/shops/royal-cuts?branch=${branch.slug}` as "/"}
                className="overflow-hidden rounded-2xl border bg-card shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex h-24 items-end bg-linear-to-br from-sidebar to-sidebar/80 p-4">
                  <p className="font-heading text-lg font-semibold text-sidebar-accent-foreground">
                    Royal Cuts · {branch.name}
                  </p>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" aria-hidden />
                      {branch.address.locality}, {branch.address.city} ·{" "}
                      {(1.4 + i * 2.3).toFixed(1)} km
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs">
                      <StarRating rating={4.8} size="xs" />
                      <span className="text-muted-foreground">(1,284)</span>
                    </p>
                  </div>
                  {nextSlot ? (
                    <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      Next: {nextSlot.label}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      Fully booked today
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular services quick-book */}
      {!query && (
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Popular services
          </h2>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
            {SERVICES.filter((s) => s.popular).map((s) => (
              <Link
                key={s.id}
                href={`/shops/royal-cuts/book?services=${s.id}` as "/"}
                className="min-w-36 shrink-0 rounded-2xl border bg-card p-3.5 shadow-xs"
              >
                <p className="text-sm font-semibold">
                  {lang === "ml" && s.nameMl ? s.nameMl : s.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.durationMin} min · {inr(s.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
