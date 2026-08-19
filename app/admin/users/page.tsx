"use client";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { allShops } from "@/lib/admin-data";
import { shopName } from "@/lib/shop-name";
import { STAFF } from "@/lib/data/seed-static";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const data = useDemoStore((s) => s.data);
  const shops = allShops();

  const ownerRows = shops.map((shop) => ({
    name: shop.ownerName,
    role: "Owner",
    shop: shopName(shop),
    status: shop.status === "churned" ? "inactive" : "active",
    tone: "gold",
  }));
  const staffRows = STAFF.slice(0, 6).map((s) => ({
    name: s.name,
    role: s.title,
    shop: "Royal Cuts",
    status: "active",
    tone: s.avatarTone,
  }));
  const rows = [...ownerRows, ...staffRows];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader title="Users" description="Owners and staff across tenants (sample)" />

      <div className="grid grid-cols-3 gap-3">
        <MetricCard compact label="Owner accounts" value={shops.length} />
        <MetricCard compact label="Staff accounts" value={14 + 21} hint="across tenants" />
        <MetricCard compact label="End customers" value={data.customers.length + 8412} />
      </div>

      <ul className="grid gap-1.5">
        {rows.map((row, i) => (
          <li
            key={`${row.name}-${i}`}
            className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
          >
            <ToneAvatar name={row.name} toneName={row.tone} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{row.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.role} · {row.shop}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                row.status === "active"
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {row.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
