"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Store } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { allShops } from "@/lib/admin-data";
import { shopName } from "@/lib/shop-name";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-success/10 text-success",
  trial: "bg-info/10 text-info",
  "past-due": "bg-warning/15 text-warning-foreground dark:text-warning",
  churned: "bg-muted text-muted-foreground",
};

export default function AdminShopsPage() {
  const shops = allShops();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader title="Shops" description={`${shops.length} businesses on the platform`} />

      {/* Mobile cards */}
      <ul className="grid gap-2 lg:hidden">
        {shops.map((shop) => (
          <li key={shop.id}>
            <Link
              href={`/admin/shops/${shop.id}` as "/"}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Store className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{shopName(shop)}</p>
                <p className="text-xs text-muted-foreground">
                  {shop.ownerName} · {shop.city} · {shop.branchCount} branch
                  {shop.branchCount > 1 ? "es" : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    STATUS_STYLE[shop.status]
                  )}
                >
                  {shop.status}
                </span>
                <p className="mt-1 text-xs font-medium tabular-nums">{inr(shop.mrr)}/mo</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border lg:block">
        <table className="w-full border-collapse bg-card text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th scope="col" className="p-3 font-medium">Shop</th>
              <th scope="col" className="p-3 font-medium">Owner</th>
              <th scope="col" className="p-3 font-medium">City</th>
              <th scope="col" className="p-3 font-medium">Plan</th>
              <th scope="col" className="p-3 font-medium">Status</th>
              <th scope="col" className="p-3 text-right font-medium">Branches</th>
              <th scope="col" className="p-3 text-right font-medium">MRR</th>
              <th scope="col" className="p-3 text-right font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr key={shop.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <Link
                    href={`/admin/shops/${shop.id}` as "/"}
                    className="font-medium hover:underline"
                  >
                    {shopName(shop)}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">{shop.ownerName}</td>
                <td className="p-3 text-muted-foreground">{shop.city}</td>
                <td className="p-3 capitalize">{shop.plan.replace("-", " ")}</td>
                <td className="p-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      STATUS_STYLE[shop.status]
                    )}
                  >
                    {shop.status}
                  </span>
                </td>
                <td className="p-3 text-right tabular-nums">{shop.branchCount}</td>
                <td className="p-3 text-right font-medium tabular-nums">{inr(shop.mrr)}</td>
                <td className="p-3 text-right text-muted-foreground tabular-nums">
                  {format(new Date(shop.createdAt), "MMM yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
