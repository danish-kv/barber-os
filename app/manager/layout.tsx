"use client";

import { DashboardShell } from "@/components/shell/app-shell";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="manager">{children}</DashboardShell>;
}
