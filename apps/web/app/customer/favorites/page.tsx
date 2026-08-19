"use client";

import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { useDemoStore } from "@/lib/store";
import { BRANCHES, SERVICES, STAFF } from "@/lib/data/seed-static";

const CUSTOMER_ID = "cu_danish";

export default function CustomerFavoritesPage() {
  const data = useDemoStore((s) => s.data);
  const customer = data.customers.find((c) => c.id === CUSTOMER_ID)!;

  const favBranches = BRANCHES.filter((b) =>
    customer.favoriteBranchIds.includes(b.id)
  );
  const favServices = SERVICES.filter((s) =>
    customer.favoriteServiceIds.includes(s.id)
  );
  const preferredStaff = STAFF.find((s) => s.id === customer.preferredStaffId);

  const empty =
    favBranches.length === 0 && favServices.length === 0 && !preferredStaff;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Favorites</h1>

      {empty ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Favorite shops, services and barbers show up here for one-tap rebooking."
          actionLabel="Explore"
          actionHref="/customer/explore"
        />
      ) : (
        <>
          {preferredStaff && (
            <section>
              <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Barber
              </h2>
              <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <ToneAvatar
                  name={preferredStaff.name}
                  toneName={preferredStaff.avatarTone}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {preferredStaff.name}
                    <StarRating rating={preferredStaff.rating} size="xs" />
                  </p>
                  <p className="text-xs text-muted-foreground">{preferredStaff.title}</p>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/shops/royal-cuts/book?staff=${preferredStaff.id}` as "/"}>
                    Book
                  </Link>
                </Button>
              </div>
            </section>
          )}

          {favBranches.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Shops
              </h2>
              <div className="grid gap-2">
                {favBranches.map((b) => (
                  <Link
                    key={b.id}
                    href={`/shops/royal-cuts?branch=${b.slug}` as "/"}
                    className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-sidebar font-heading text-base font-semibold text-sidebar-primary">
                      R
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        Royal Cuts · {b.name}
                        <Star className="size-3 fill-warning text-warning" aria-hidden />
                        <span className="text-xs">4.8</span>
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" aria-hidden />
                        {b.address.locality}, {b.address.city}
                      </p>
                    </div>
                    <Heart className="size-4 fill-destructive text-destructive" aria-hidden />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {favServices.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Services
              </h2>
              <div className="grid gap-2">
                {favServices.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-2xl border bg-card p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{s.price} · {s.durationMin} min
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/shops/royal-cuts/book?services=${s.id}` as "/"}>
                        Book
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
