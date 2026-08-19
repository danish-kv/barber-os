"use client";

import { DashboardShell } from "@/components/shell/app-shell";

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="receptionist">{children}</DashboardShell>;
}
