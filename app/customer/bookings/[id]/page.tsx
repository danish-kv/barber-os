"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarPlus,
  CalendarX2,
  Check,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore, priceForSelection } from "@/lib/store";
import { branchById, serviceNames, staffById, queueForBranch } from "@/lib/selectors";
import { SERVICES, ADDONS } from "@/lib/data/seed-static";
import { inr } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const QUEUE_STEPS = [
  "queue.checkedIn",
  "queue.waiting",
  "queue.next",
  "queue.inService",
  "queue.complete",
] as const;

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const data = useDemoStore((s) => s.data);
  const lang = useDemoStore((s) => s.session.language);
  const cancelAppointment = useDemoStore((s) => s.cancelAppointment);
  const [cancelOpen, setCancelOpen] = useState(false);

  const appt = data.appointments.find((a) => a.id === id);

  if (!appt) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Booking not found"
        description="This booking may have been removed when demo data was reset."
        actionLabel="Back to bookings"
        actionHref="/customer/bookings"
      />
    );
  }

  const staff = staffById(appt.staffId);
  const branch = branchById(appt.branchId);
  const price = priceForSelection(appt.serviceIds, appt.addonIds);
  const start = new Date(appt.start);
  const isUpcoming = ["confirmed", "checked-in", "waiting", "in-service"].includes(
    appt.status
  );
  const advance = appt.advancePaid ? (appt.advanceAmount ?? 0) : 0;
  const fullPaid = appt.paymentPreference === "full" && appt.advancePaid;
  const invoice = appt.invoiceId
    ? data.invoices.find((i) => i.id === appt.invoiceId)
    : undefined;

  // Live queue view when waiting
  const queue = queueForBranch(data, appt.branchId);
  const queuePosition =
    appt.status === "waiting"
      ? queue.waiting.findIndex((w) => w.id === appt.id) + 1
      : 0;

  const queueStage =
    appt.status === "completed"
      ? 4
      : appt.status === "in-service"
        ? 3
        : appt.status === "waiting"
          ? queuePosition === 1
            ? 2
            : 1
          : appt.status === "checked-in"
            ? 0
            : -1;

  const share = async () => {
    const text = `Royal Cuts booking: ${serviceNames(appt.serviceIds)} on ${format(start, "d MMM, h:mm a")}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Royal Cuts booking", text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied booking details");
    }
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="-ml-2 size-9" asChild>
          <Link href="/customer/bookings" aria-label="Back to bookings">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="font-heading text-xl font-semibold">Booking details</h1>
        <StatusBadge status={appt.status} className="ml-auto" />
      </div>

      {/* Live queue tracker */}
      {(appt.status === "waiting" || appt.status === "in-service") && (
        <section className="rounded-2xl border bg-sidebar p-5 text-sidebar-foreground">
          <p className="text-xs font-semibold tracking-widest text-sidebar-primary uppercase">
            {t("queue.youreInQueue", lang)}
          </p>
          {appt.status === "waiting" ? (
            <>
              <p className="mt-2 font-heading text-4xl font-semibold text-sidebar-accent-foreground">
                #{queuePosition || appt.queueNumber || 1}
              </p>
              <p className="mt-1 text-sm text-sidebar-foreground/80">
                {t("queue.estimatedWait", lang)}:{" "}
                <strong className="text-sidebar-accent-foreground">
                  {appt.estimatedWaitMin ?? 10} {t("book.min", lang)}
                </strong>
              </p>
              {queuePosition > 1 && (
                <p className="text-xs text-sidebar-foreground/60">
                  {queuePosition - 1} {t("queue.ahead", lang)}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 font-heading text-2xl font-semibold text-sidebar-accent-foreground">
              {t("queue.inService", lang)}
            </p>
          )}
          {/* status timeline */}
          <ol className="mt-5 flex items-center gap-1" aria-label="Queue progress">
            {QUEUE_STEPS.map((key, i) => {
              const done = i <= queueStage;
              return (
                <li key={key} className="flex flex-1 flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold",
                      done
                        ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                        : "border-sidebar-border text-sidebar-foreground/50"
                    )}
                  >
                    {done ? <Check className="size-3" aria-hidden /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-center text-[9px] leading-tight",
                      done ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/50"
                    )}
                  >
                    {t(key, lang)}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Booking card */}
      <section className="rounded-2xl border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-3">
          {staff ? (
            <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="lg" />
          ) : (
            <span className="flex size-12 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              Any
            </span>
          )}
          <div className="min-w-0">
            <p className="font-heading text-lg font-semibold">
              {serviceNames(appt.serviceIds)}
            </p>
            <p className="text-sm text-muted-foreground">
              {staff?.name ?? t("book.anyBarber", lang)} · Royal Cuts {branch?.name}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Date</dt>
            <dd className="font-medium">{format(start, "EEEE, d MMM yyyy")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Time</dt>
            <dd className="font-medium">{format(start, "h:mm a")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Booking ID</dt>
            <dd className="font-mono text-xs font-medium uppercase">{appt.id.slice(-8)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Source</dt>
            <dd className="font-medium capitalize">{appt.source}</dd>
          </div>
        </dl>

        <Separator className="my-4" />

        {/* Price breakdown */}
        <div className="grid gap-1.5 text-sm">
          {appt.serviceIds.map((sid) => {
            const svc = SERVICES.find((s) => s.id === sid);
            if (!svc) return null;
            return (
              <div key={sid} className="flex justify-between">
                <span className="text-muted-foreground">{svc.name}</span>
                <span className="tabular-nums">{inr(svc.price)}</span>
              </div>
            );
          })}
          {appt.addonIds.map((aid) => {
            const addon = ADDONS.find((a) => a.id === aid);
            if (!addon) return null;
            return (
              <div key={aid} className="flex justify-between">
                <span className="text-muted-foreground">{addon.name} (add-on)</span>
                <span className="tabular-nums">{inr(addon.price)}</span>
              </div>
            );
          })}
          {(advance > 0 || fullPaid) && (
            <div className="flex justify-between text-success">
              <span>{fullPaid ? "Paid online" : t("book.advancePaid", lang)}</span>
              <span className="tabular-nums">−{inr(fullPaid ? price : advance)}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between font-semibold">
            <span>{fullPaid ? "Balance" : t("book.balanceAtShop", lang)}</span>
            <span className="font-heading tabular-nums">
              {inr(fullPaid ? 0 : Math.max(0, price - advance))}
            </span>
          </div>
          {invoice && (
            <p className="mt-1 text-xs text-success">
              Paid in full · Receipt {invoice.receiptNumber}
            </p>
          )}
        </div>
      </section>

      {/* Actions */}
      <section className="grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <a
            href={`https://maps.google.com/?q=Royal+Cuts+${branch?.name ?? "Kochi"}`}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin className="size-4" aria-hidden />
            {t("book.getDirections", lang)}
          </a>
        </Button>
        <Button variant="outline" onClick={share}>
          <Share2 className="size-4" aria-hidden />
          {t("book.share", lang)}
        </Button>
        <Button variant="outline" asChild>
          <a href={`tel:${branch?.phone.replace(/\s/g, "")}`}>
            <Phone className="size-4" aria-hidden />
            Call shop
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href={`https://wa.me/${branch?.whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </a>
        </Button>
      </section>

      {isUpcoming && appt.status === "confirmed" && (
        <section className="grid gap-2">
          <Button variant="outline" asChild>
            <Link
              href={
                `/shops/royal-cuts/book?services=${appt.serviceIds.join(",")}&staff=${appt.staffId ?? ""}` as "/"
              }
            >
              <CalendarPlus className="size-4" aria-hidden />
              Reschedule (book a new slot)
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setCancelOpen(true)}
          >
            <CalendarX2 className="size-4" aria-hidden />
            Cancel booking
          </Button>
        </section>
      )}

      {appt.status === "completed" && (
        <Button size="lg" className="w-full" asChild>
          <Link
            href={
              `/shops/royal-cuts/book?services=${appt.serviceIds.join(",")}&staff=${appt.staffId ?? ""}` as "/"
            }
          >
            <RotateCcw className="size-4" aria-hidden />
            Book this again
          </Link>
        </Button>
      )}

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {advance > 0
                ? `Your ₹${advance} advance will be refunded to your wallet (simulated).`
                : "The slot will be released for other customers."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                cancelAppointment(appt.id, "Cancelled by customer");
                toast.success("Booking cancelled", {
                  description: "The slot has been released.",
                });
                router.push("/customer/bookings");
              }}
            >
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
