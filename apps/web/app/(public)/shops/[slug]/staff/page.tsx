"use client";

import { Suspense, use } from "react";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/public/shop-page";
import { Skeleton } from "@/components/ui/skeleton";
import { BUSINESS } from "@/lib/data/seed-static";

export default function ShopStaffPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  if (slug !== BUSINESS.slug) notFound();
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-6 h-96 max-w-3xl rounded-2xl" />}>
      <ShopPage initialTab="staff" />
    </Suspense>
  );
}
