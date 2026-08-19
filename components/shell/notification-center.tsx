"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const CATEGORY_TONE: Record<string, string> = {
  booking: "bg-info",
  queue: "bg-warning",
  inventory: "bg-destructive",
  staff: "bg-chart-2",
  payment: "bg-success",
  system: "bg-muted-foreground",
};

export function NotificationCenter({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const notifications = useDemoStore((s) => s.data.notifications);
  const markRead = useDemoStore((s) => s.markNotificationRead);
  const markAllRead = useDemoStore((s) => s.markAllNotificationsRead);

  const mine = notifications
    .filter((n) => n.role === role || n.role === "all")
    .slice(0, 30);
  const unread = mine.filter((n) => !n.read).length;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative size-9 rounded-full"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        onClick={() => setOpen(true)}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Notifications"
        contentClassName="sm:max-w-lg"
      >
        <div className="pb-2">
          {mine.length > 0 && unread > 0 && (
            <div className="mb-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => markAllRead(role)}
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            </div>
          )}
          {mine.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="All caught up"
              description="Nothing needs your attention right now."
              className="border-0"
            />
          ) : (
            <ul className="grid gap-1">
              {mine.map((n) => (
                <li key={n.id}>
                  <div
                    className={cn(
                      "rounded-lg p-3 transition-colors",
                      n.read ? "opacity-70" : "bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          CATEGORY_TONE[n.category] ?? "bg-muted-foreground"
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{n.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground">
                            {relativeTime(n.createdAt)}
                          </span>
                          {n.actionHref && n.actionLabel && (
                            <Link
                              href={n.actionHref as "/"}
                              onClick={() => {
                                markRead(n.id);
                                setOpen(false);
                              }}
                              className="text-[11px] font-medium text-primary hover:underline"
                            >
                              {n.actionLabel}
                            </Link>
                          )}
                          {!n.read && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
