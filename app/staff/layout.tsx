"use client";

import { MobileAppShell } from "@/components/shell/app-shell";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <MobileAppShell role="barber">{children}</MobileAppShell>;
}
