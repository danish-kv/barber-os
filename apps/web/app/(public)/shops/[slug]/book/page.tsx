"use client";

import { use } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { BookingFlow } from "@/components/booking/booking-flow";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { BUSINESS, BRANCHES, SERVICES, STAFF } from "@/lib/data/seed-static";
import { useHydrated } from "@/lib/demo-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const hydrated = useHydrated();

  if (slug !== BUSINESS.slug) notFound();

  const branchSlug = searchParams.get("branch");
  const branch =
    BRANCHES.find((b) => b.slug === branchSlug) ??
    BRANCHES.find((b) => b.isPrimary)!;

  const validServiceIds = new Set(SERVICES.map((s) => s.id));
  const preServices = (searchParams.get("services") ?? "")
    .split(",")
    .filter((id) => validServiceIds.has(id));

  const staffParam = searchParams.get("staff");
  const preStaff =
    staffParam === ""
      ? null
      : staffParam && STAFF.some((s) => s.id === staffParam)
        ? staffParam
        : undefined;

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-2xl">
      <div className="mb-2 flex justify-end">
        <LanguageToggle />
      </div>
      {hydrated ? (
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
