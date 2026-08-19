"use client";

import { DashboardShell } from "@/components/shell/app-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="admin">{children}</DashboardShell>;
}
