import type { PlatformShop } from "@/lib/types";

const NAMES: Record<string, string> = {
  shop_royalcuts: "Royal Cuts",
  shop_trendcutz: "Trend Cutz",
  shop_gentlemans: "The Gentleman's Room",
  shop_salondekerala: "Salon de Kerala",
  shop_fadefactory: "Fade Factory",
  shop_classicclippers: "Classic Clippers",
  shop_glowstudio: "Glow Studio",
  shop_urbanbarber: "Urban Barber Co.",
  shop_stylecircle: "Style Circle",
};

export function shopName(shop: Pick<PlatformShop, "id">) {
  return NAMES[shop.id] ?? shop.id;
}
