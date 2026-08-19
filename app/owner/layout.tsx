"use client";

import { DashboardShell } from "@/components/shell/app-shell";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="owner">{children}</DashboardShell>;
}
