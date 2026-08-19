"use client";

// Public shop profile — mobile-first, WhatsApp-link friendly, localized.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { useDemoStore } from "@/lib/store";
import { customerById } from "@/lib/selectors";
import { BRANCHES, BUSINESS, SERVICES, STAFF } from "@/lib/data/seed-static";
import { availableSlotsAnyStaff } from "@/lib/availability";
import { durationLabel, inr, relativeTime } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ShopTab = "services" | "staff" | "reviews";

export function ShopPage({ initialTab = "services" }: { initialTab?: ShopTab }) {
  const searchParams = useSearchParams();
  const data = useDemoStore((s) => s.data);
  const lang = useDemoStore((s) => s.session.language);
  const [tab, setTab] = useState<ShopTab>(initialTab);

  const branchSlug = searchParams.get("branch");
  const branch =
    BRANCHES.find((b) => b.slug === branchSlug) ?? BRANCHES.find((b) => b.isPrimary)!;

  const todaySlots = useMemo(
    () => availableSlotsAnyStaff(data, branch.id, new Date(), ["sv_haircut"]),
    [data, branch.id]
  );

  const branchStaff = STAFF.filter((s) => s.branchId === branch.id);
  const reviews = data.reviews
    .filter((r) => r.branchId === branch.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 10);

  const dow = new Date().getDay();
  const hoursToday = branch.hours.find((h) => h.day === dow);
  const bookHref = `/shops/${BUSINESS.slug}/book?branch=${branch.slug}`;

  return (
    <div className="pb-28">
      {/* Hero */}
      <div className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-3xl px-4 pt-8 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl font-semibold text-sidebar-accent-foreground">
                {BUSINESS.name}
              </h1>
              <p className="mt-0.5 text-sm text-sidebar-foreground/80">
                {BUSINESS.tagline}
              </p>
            </div>
            <LanguageToggle className="bg-sidebar-accent/50 border-sidebar-border" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-warning text-warning" aria-hidden />
              <strong className="text-sidebar-accent-foreground">
                {BUSINESS.ratingAverage}
              </strong>
              <span className="text-sidebar-foreground/70">
                ({BUSINESS.ratingCount.toLocaleString("en-IN")})
              </span>
            </span>
            <span className="flex items-center gap-1 text-sidebar-foreground/80">
              <MapPin className="size-3.5" aria-hidden />
              {branch.address.locality}, {branch.address.city}
            </span>
            <span className="flex items-center gap-1 text-sidebar-foreground/80">
              <Clock className="size-3.5" aria-hidden />
              {hoursToday && !hoursToday.closed
                ? `${t("shop.openToday", lang)} ${hoursToday.open} – ${hoursToday.close}`
                : "Closed today"}
            </span>
          </div>

          {/* Branch picker */}
          <div className="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar">
            {BRANCHES.map((b) => (
              <Link
                key={b.id}
                href={`/shops/${BUSINESS.slug}?branch=${b.slug}` as "/"}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  b.id === branch.id
                    ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                    : "border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent"
                )}
              >
                {b.name}
              </Link>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Button variant="secondary" size="sm" asChild>
              <a href={`tel:${branch.phone.replace(/\s/g, "")}`}>
                <Phone className="size-4" aria-hidden />
                Call
              </a>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <a
                href={`https://wa.me/${branch.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" aria-hidden />
                WhatsApp
              </a>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${BUSINESS.name} ${branch.address.locality} ${branch.address.city}`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin className="size-4" aria-hidden />
                Map
              </a>
            </Button>
          </div>

          {todaySlots.length > 0 && (
            <p className="mt-4 text-xs text-sidebar-foreground/70">
              Next haircut slot today:{" "}
              <strong className="text-sidebar-primary">{todaySlots[0].label}</strong>
              {todaySlots[1] && ` · then ${todaySlots[1].label}`}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl px-4" role="tablist" aria-label="Shop sections">
          {(
            [
              ["services", t("shop.services", lang)],
              ["staff", t("shop.staff", lang)],
              ["reviews", t("shop.reviews", lang)],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-5">
        {tab === "services" && (
          <div className="grid gap-2">
            {SERVICES.filter((s) => s.branchIds.includes(branch.id)).map((svc) => (
              <Link
                key={svc.id}
                href={`${bookHref}&services=${svc.id}` as "/"}
                className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {lang === "ml" && svc.nameMl ? svc.nameMl : svc.name}
                    {svc.popular && (
                      <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-accent-foreground">
                        {t("book.popular", lang)}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {svc.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <Clock className="mr-1 inline size-3" aria-hidden />
                    {durationLabel(svc.durationMin)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-heading text-base font-semibold">{inr(svc.price)}</p>
                  <span className="text-xs font-medium text-primary">
                    {t("shop.bookNow", lang)} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === "staff" && (
          <div className="grid gap-2">
            {branchStaff.map((staff) => (
              <div key={staff.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {staff.name}
                    <StarRating rating={staff.rating} size="xs" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {staff.title} · {staff.experienceYears} {t("shop.experience", lang)}
                  </p>
                  {staff.bio && (
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {staff.bio}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`${bookHref}&staff=${staff.id}` as "/"}>Book</Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div className="grid gap-2">
            {reviews.map((review) => {
              const customer = customerById(data, review.customerId);
              return (
                <div key={review.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-2.5">
                    {customer && (
                      <ToneAvatar
                        name={customer.name}
                        toneName={customer.avatarTone}
                        size="xs"
                      />
                    )}
                    <span className="text-sm font-medium">{customer?.name}</span>
                    <StarRating rating={review.ratingOverall} size="xs" showValue={false} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {relativeTime(review.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">&ldquo;{review.comment}&rdquo;</p>
                  {review.response && (
                    <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                      <strong>{BUSINESS.name}:</strong> {review.response}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* QR concept */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed p-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <QrCode className="size-6 text-muted-foreground" aria-hidden />
          </span>
          <p className="text-xs text-muted-foreground">
            In the shop? Scan the counter QR to join the queue, book, pay or
            review — this page is what it opens.
          </p>
        </div>
      </div>

      {/* Sticky book CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur pb-safe">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {BUSINESS.name} · {branch.name}
            </p>
            <p className="text-sm font-medium">
              {todaySlots.length > 0
                ? `${todaySlots.length}+ slots today`
                : "Book for tomorrow"}
            </p>
          </div>
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link href={bookHref as "/"}>{t("shop.bookNow", lang)}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
