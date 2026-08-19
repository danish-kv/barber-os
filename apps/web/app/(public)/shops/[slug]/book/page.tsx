"use client";

// Booking entry, gated by the shop's operating mode (Demo V1.1 §21):
// staff-only and walk-in-only shops never see a booking form — visitors are
// sent back to the profile page, which shows the right CTAs instead.

import { use, useEffect } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { BookingFlow } from "@/components/booking/booking-flow";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { ALL_BRANCHES, ALL_BUSINESSES, ALL_SERVICES, SEED_STAFF } from "@/lib/data/seed-static";
import { useHydrated } from "@/lib/demo-provider";
import { useDemoStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const data = useDemoStore((s) => s.data);

  const business = ALL_BUSINESSES.find((b) => b.slug === slug);
  const isActiveBusiness = business?.id === data.businessId;
  const canBookOnline =
    data.config.bookingMode === "online_instant" ||
    data.config.bookingMode === "online_request";

  useEffect(() => {
    if (hydrated && business && (!isActiveBusiness || !canBookOnline)) {
      router.replace(`/shops/${slug}` as "/");
    }
  }, [hydrated, business, isActiveBusiness, canBookOnline, router, slug]);

  if (!business) notFound();

  const branches = ALL_BRANCHES.filter((b) => b.businessId === business.id);
  const branchSlug = searchParams.get("branch");
  const branch =
    branches.find((b) => b.slug === branchSlug) ??
    branches.find((b) => b.isPrimary) ??
    branches[0];

  const validServiceIds = new Set(ALL_SERVICES.map((s) => s.id));
  const preServices = (searchParams.get("services") ?? "")
    .split(",")
    .filter((id) => validServiceIds.has(id));

  const staffParam = searchParams.get("staff");
  const preStaff =
    staffParam === ""
      ? null
      : staffParam && SEED_STAFF.some((s) => s.id === staffParam)
        ? staffParam
        : undefined;

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-2xl">
      <div className="mb-2 flex justify-end">
        <LanguageToggle />
      </div>
      {hydrated && isActiveBusiness && canBookOnline ? (
        <BookingFlow
          branchId={branch.id}
          preselectServiceIds={preServices}
          preselectStaffId={preStaff}
          backHref={`/shops/${slug}`}
        />
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-1 w-full" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}
    </div>
  );
}
