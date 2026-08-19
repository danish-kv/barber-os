// Derived platform-level metrics for the SaaS admin. Royal Cuts is the "live"
// tenant backed by real demo state; other shops are static seed rows.

import { OTHER_PLATFORM_SHOPS, SUBSCRIPTION_PLANS } from "@/lib/data/seed-static";
import type { DemoData } from "@/lib/data/seed";
import type { PlatformShop } from "@/lib/types";

export function allShops(): PlatformShop[] {
  const royalCuts: PlatformShop = {
    id: "shop_royalcuts",
    businessId: "biz_royalcuts",
    ownerName: "Vikram Menon",
    plan: "business",
    status: "active",
    branchCount: 4,
    mrr: 1499,
    createdAt: "2022-03-14T00:00:00.000Z",
    city: "Kochi",
    supportOpenTickets: 0,
  };
  return [royalCuts, ...OTHER_PLATFORM_SHOPS];
}

export function platformMetrics(data: DemoData) {
  const shops = allShops();
  const active = shops.filter((s) => s.status === "active");
  const trial = shops.filter((s) => s.status === "trial");
  const churned = shops.filter((s) => s.status === "churned");
  const mrr = shops.reduce((s, shop) => s + shop.mrr, 0);
  const bookingsProcessed = data.appointments.length + 12480; // + historic simulated
  const paymentVolume =
    data.invoices.reduce((s, i) => s + i.total, 0) + 4_620_000;
  const activeCustomers = data.customers.length + 8_412;

  const planDistribution = SUBSCRIPTION_PLANS.map((plan) => ({
    plan,
    count: shops.filter((s) => s.plan === plan.id).length,
  }));

  return {
    shops,
    active,
    trial,
    churned,
    mrr,
    bookingsProcessed,
    paymentVolume,
    activeCustomers,
    planDistribution,
    churnRate: churned.length / Math.max(1, shops.length),
  };
}
