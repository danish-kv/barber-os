"use client";

import { Suspense, use } from "react";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/public/shop-page";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_BUSINESSES } from "@/lib/data/seed-static";

export default function ShopReviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  if (!ALL_BUSINESSES.some((b) => b.slug === slug)) notFound();
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-6 h-96 max-w-3xl rounded-2xl" />}>
      <ShopPage slug={slug} initialTab="reviews" />
    </Suspense>
  );
}
