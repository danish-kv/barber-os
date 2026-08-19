"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { allShops } from "@/lib/admin-data";
import { shopName } from "@/lib/shop-name";
import { inr, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AdminShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const data = useDemoStore((s) => s.data);
  const shop = allShops().find((s) => s.id === id);

  if (!shop) {
    return (
      <EmptyState
        icon={Store}
        title="Shop not found"
        actionLabel="Back to shops"
        actionHref="/admin/shops"
      />
    );
  }

  const isRoyalCuts = shop.businessId === "biz_royalcuts";
  const bookings = isRoyalCuts ? data.appointments.length : Math.round(shop.mrr * 2.4);
  const volume = isRoyalCuts
    ? data.invoices.reduce((s, i) => s + i.total, 0)
    : shop.mrr * 320;
  const tickets = data.supportTickets.filter((t) => t.shopId === shop.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="-ml-2 size-9" asChild>
          <Link href="/admin/shops" aria-label="Back to shops">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <PageHeader title={shopName(shop)} description={`${shop.city} · owned by ${shop.ownerName}`} />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard compact label="Plan" value={shop.mrr} format={() => shop.plan.replace("-", " ")} />
        <MetricCard compact label="MRR" value={shop.mrr} format={(n) => inr(n)} />
        <MetricCard compact label="Bookings processed" value={bookings} />
        <MetricCard compact label="Payment volume" value={volume} format={(n) => inr(n, { compact: true })} />
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-sm font-semibold">Subscription</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd
              className={cn(
                "mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                shop.status === "active" && "bg-success/10 text-success",
                shop.status === "trial" && "bg-info/10 text-info",
                shop.status === "past-due" && "bg-warning/15 text-warning-foreground dark:text-warning",
                shop.status === "churned" && "bg-muted text-muted-foreground"
              )}
            >
              {shop.status}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Customer since</dt>
            <dd className="mt-1 font-medium">
              {format(new Date(shop.createdAt), "d MMM yyyy")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Branches</dt>
            <dd className="mt-1 font-medium">{shop.branchCount}</dd>
          </div>
        </dl>
        <div className="mt-4 flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast("Impersonation (simulated)", { description: "Support impersonation would open the tenant here." })}
          >
            View as owner
          </Button>
          {shop.status === "past-due" && (
            <Button
              size="sm"
              onClick={() => toast.success("Payment retry queued (simulated)")}
            >
              Retry payment
            </Button>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Support tickets ({tickets.length})
        </h2>
        {tickets.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            No tickets from this shop.
          </p>
        ) : (
          <ul className="grid gap-2">
            {tickets.map((t) => (
              <li key={t.id} className="rounded-2xl border bg-card p-4">
                <p className="text-sm font-semibold">{t.subject}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.lastMessage}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t.status} · {t.priority} priority · {relativeTime(t.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isRoyalCuts && (
        <p className="rounded-xl bg-accent/50 px-4 py-3 text-xs text-accent-foreground">
          This tenant is backed by the live demo state — bookings and payments you
          make in other roles show up here.
        </p>
      )}
    </div>
  );
}
