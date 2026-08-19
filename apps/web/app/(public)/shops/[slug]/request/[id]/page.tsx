"use client";

// Booking-request status (Demo V1.1 §18): the customer's view of a request
// as the shop accepts, suggests a different time, or declines.

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, Hourglass, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoStore } from "@/lib/store";
import { useHydrated } from "@/lib/demo-provider";
import { ALL_BRANCHES, ALL_BUSINESSES, ALL_SERVICES } from "@/lib/data/seed-static";
import { cn } from "@/lib/utils";

export default function RequestStatusPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const hydrated = useHydrated();
  const data = useDemoStore((s) => s.data);
  const acceptSuggestedTime = useDemoStore((s) => s.acceptSuggestedTime);

  const business = ALL_BUSINESSES.find((b) => b.slug === slug);
  if (!business) notFound();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-10">
        <Skeleton className="mx-auto size-20 rounded-full" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const request = data.bookingRequests.find((r) => r.id === id);
  if (!request) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold">Request not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may belong to another demo scenario, or the demo was reset.
        </p>
        <Button variant="outline" className="mt-5" asChild>
          <Link href={`/shops/${slug}` as "/"}>Back to {business.name}</Link>
        </Button>
      </div>
    );
  }

  const branch = ALL_BRANCHES.find((b) => b.id === request.branchId);
  const serviceNames = request.serviceIds
    .map((sid) => ALL_SERVICES.find((s) => s.id === sid)?.name)
    .filter(Boolean)
    .join(" + ");
  const telHref = `tel:${branch?.phone.replace(/\s/g, "") ?? ""}`;

  const statusView = {
    requested: {
      icon: Hourglass,
      tone: "bg-warning/10 text-warning",
      title: "Waiting for the shop",
      body: "Your request has been sent — the shop will confirm or suggest another time.",
    },
    suggested: {
      icon: Hourglass,
      tone: "bg-info/10 text-info",
      title: "The shop suggested a new time",
      body: "Your preferred slot wasn't free — accept the suggestion or call the shop.",
    },
    confirmed: {
      icon: Check,
      tone: "bg-success/10 text-success",
      title: "Booking confirmed",
      body: "You're on the schedule. See you there!",
    },
    declined: {
      icon: X,
      tone: "bg-destructive/10 text-destructive",
      title: "Request declined",
      body: "The shop couldn't take this one — give them a call to find a time.",
    },
  }[request.status];

  return (
    <div className="mx-auto max-w-lg px-4 pt-10 pb-16 text-center">
      <span
        className={cn(
          "mx-auto flex size-20 items-center justify-center rounded-full",
          statusView.tone
        )}
      >
        <statusView.icon className="size-9" aria-hidden />
      </span>
      <h1 className="mt-5 font-heading text-2xl font-semibold">{statusView.title}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {statusView.body}
      </p>

      <div className="mt-6 rounded-2xl border bg-card p-5 text-left">
        <p className="font-heading text-base font-semibold">{serviceNames}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {business.name}
          {branch && branch.name !== business.name ? ` · ${branch.name}` : ""}
        </p>
        <dl className="mt-4 grid gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Requested time</dt>
            <dd
              className={cn(
                "font-medium",
                request.status === "suggested" && "line-through opacity-60"
              )}
            >
              {format(new Date(request.preferredStart), "EEE d MMM · h:mm a")}
            </dd>
          </div>
          {request.suggestedStart && request.status !== "confirmed" && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Suggested time</dt>
              <dd className="font-medium text-info">
                {format(new Date(request.suggestedStart), "EEE d MMM · h:mm a")}
              </dd>
            </div>
          )}
          {request.status === "confirmed" && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Confirmed time</dt>
              <dd className="font-medium text-success">
                {format(
                  new Date(
                    data.appointments.find((a) => a.id === request.appointmentId)
                      ?.start ??
                      request.suggestedStart ??
                      request.preferredStart
                  ),
                  "EEE d MMM · h:mm a"
                )}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{request.customerName}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid gap-2">
        {request.status === "suggested" && request.suggestedStart && (
          <Button
            size="lg"
            className="h-12"
            onClick={() => {
              acceptSuggestedTime(request.id);
              toast.success("Booking confirmed", {
                description: format(
                  new Date(request.suggestedStart!),
                  "EEE d MMM · h:mm a"
                ),
              });
            }}
          >
            <Check className="size-4" aria-hidden />
            Accept {format(new Date(request.suggestedStart), "h:mm a")}
          </Button>
        )}
        {request.status === "declined" && (
          <Button size="lg" className="h-12" asChild>
            <a href={telHref}>
              <Phone className="size-4" aria-hidden />
              Call the shop
            </a>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href={`/shops/${slug}` as "/"}>Back to {business.name}</Link>
        </Button>
      </div>
    </div>
  );
}
