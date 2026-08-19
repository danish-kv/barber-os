"use client";

import { Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { BarList } from "@/components/charts/bar-list";
import { useDemoStore } from "@/lib/store";
import { reviewSummary } from "@/lib/selectors";
import { allShops } from "@/lib/admin-data";
import { shopName } from "@/lib/shop-name";
import { Rng } from "@/lib/data/rng";

export default function AdminReviewsPage() {
  const data = useDemoStore((s) => s.data);
  const shops = allShops().filter((s) => s.status !== "churned");
  const royal = reviewSummary(data, "all");
  const rng = new Rng(7);

  const rows = shops.map((shop) => ({
    shop,
    rating:
      shop.businessId === "biz_royalcuts"
        ? royal.overall
        : Math.round((4.1 + rng.next() * 0.8) * 10) / 10,
    count:
      shop.businessId === "biz_royalcuts" ? royal.count : rng.int(40, 600),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Reviews across tenants"
        description="Platform-wide review health (simulated for non-demo tenants)"
      />

      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          compact
          label="Platform average"
          value={Math.round(
            (rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 10
          )}
          format={(n) => (n / 10).toFixed(1)}
        />
        <MetricCard
          compact
          label="Total reviews"
          value={rows.reduce((s, r) => s + r.count, 0)}
        />
        <MetricCard
          compact
          label="Response rate"
          value={68}
          format={(n) => `${n}%`}
        />
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          <Star className="size-4 fill-warning text-warning" aria-hidden />
          Ratings by shop
        </h2>
        <BarList
          className="mt-4"
          color="var(--chart-4)"
          items={rows
            .sort((a, b) => b.rating - a.rating)
            .map((r) => ({
              label: shopName(r.shop),
              value: r.rating,
              hint: `${r.count} reviews`,
            }))}
          formatValue={(v) => v.toFixed(1)}
        />
      </section>
    </div>
  );
}
