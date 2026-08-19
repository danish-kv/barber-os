"use client";

import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { allShops } from "@/lib/admin-data";
import { shopName } from "@/lib/shop-name";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AdminSupportPage() {
  const data = useDemoStore((s) => s.data);
  const shops = allShops();
  const tickets = [...data.supportTickets].sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 } as const;
    return p[a.priority] - p[b.priority];
  });

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Support inbox"
        description={`${tickets.filter((t) => t.status !== "resolved").length} open tickets`}
      />

      {tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="Inbox zero" description="No support tickets." />
      ) : (
        <ul className="grid gap-2">
          {tickets.map((t) => {
            const shop = shops.find((s) => s.id === t.shopId);
            return (
              <li key={t.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {shop ? shopName(shop) : t.shopId} · {relativeTime(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        t.priority === "high" && "bg-destructive/10 text-destructive",
                        t.priority === "medium" && "bg-warning/15 text-warning-foreground dark:text-warning",
                        t.priority === "low" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        t.status === "open" && "bg-info/10 text-info",
                        t.status === "pending" && "bg-warning/15 text-warning-foreground dark:text-warning",
                        t.status === "resolved" && "bg-success/10 text-success"
                      )}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.lastMessage}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast("Reply composer (simulated)")}
                  >
                    Reply
                  </Button>
                  {t.status !== "resolved" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.success("Ticket resolved (simulated)")}
                    >
                      Mark resolved
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
