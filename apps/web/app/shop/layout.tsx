// Server layout: the unified owner+barber area shares the staff PWA
// identity — for a solo barber, /shop IS the staff app, so an install from
// here and an install from /staff are the same home-screen app.

import type { Metadata } from "next";
import { ShopShell } from "@/components/shop/shop-shell";
import {
  STAFF_APP_SHORT_NAME,
  STAFF_MANIFEST_URL,
} from "@/lib/pwa-manifest";

export const metadata: Metadata = {
  manifest: STAFF_MANIFEST_URL,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: STAFF_APP_SHORT_NAME,
  },
  icons: {
    apple: "/staff-apple-touch-icon.png",
  },
};

export default function ShopLayout({ children }: LayoutProps<"/shop">) {
  return <ShopShell>{children}</ShopShell>;
}
