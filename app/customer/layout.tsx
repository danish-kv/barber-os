"use client";

import { MobileAppShell } from "@/components/shell/app-shell";
import { LanguageToggle } from "@/components/shared/language-toggle";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileAppShell role="customer" headerExtra={<LanguageToggle />}>
      {children}
    </MobileAppShell>
  );
}
