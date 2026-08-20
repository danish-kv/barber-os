// Server layout so the staff area carries its own PWA identity: staff pages
// link the staff manifest (installed app = "<Product> Staff", launches to
// /staff) while the rest of the site keeps the public /manifest.webmanifest.

import type { Metadata } from "next";
import { MobileAppShell } from "@/components/shell/app-shell";
import { StaffScenarioRedirect } from "@/components/pwa/staff-scenario-redirect";
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

export default function StaffLayout({ children }: LayoutProps<"/staff">) {
  return (
    <MobileAppShell role="barber">
      <StaffScenarioRedirect />
      {children}
    </MobileAppShell>
  );
}
