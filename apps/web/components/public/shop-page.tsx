"use client";

// Public shop profile — mobile-first, WhatsApp-link friendly, localized.
// Mode-aware (Demo V1.1 §19–§22): the CTA follows how the shop actually
// takes bookings. A staff-only shop gets Call/WhatsApp — never a dead form.

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  Clock,
  Footprints,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { useDemoStore } from "@/lib/store";
import { customerById, queueForBranch, staffForBranch } from "@/lib/selectors";
import { ALL_BRANCHES, ALL_BUSINESSES, ALL_SERVICES } from "@/lib/data/seed-static";
import { availableSlotsAnyStaff } from "@/lib/availability";
import { durationLabel, inr, relativeTime } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { ScenarioId } from "@/lib/types";
import { cn } from "@/lib/utils";

type ShopTab = "services" | "staff" | "reviews";

const BUSINESS_SCENARIO: Record<string, ScenarioId> = {
  biz_danishstudio: "solo",
  biz_brothers: "small",
  biz_royalcuts: "premium",
};

export function ShopPage({
  slug,
  initialTab = "services",
}: {
  slug: string;
  initialTab?: ShopTab;
}) {
  const searchParams = useSearchParams();
  const data = useDemoStore((s) => s.data);
  const lang = useDemoStore((s) => s.session.language);
  const setScenario = useDemoStore((s) => s.setScenario);
  const addWalkIn = useDemoStore((s) => s.addWalkIn);
  const [tab, setTab] = useState<ShopTab>(initialTab);
  const [queueName, setQueueName] = useState("");
  const [joinedId, setJoinedId] = useState<string | null>(null);

  const business = ALL_BUSINESSES.find((b) => b.slug === slug)!;
  const isActiveBusiness = business.id === data.businessId;

  const branches = ALL_BRANCHES.filter((b) => b.businessId === business.id);
  const branchSlug = searchParams.get("branch");
  const branch =
    branches.find((b) => b.slug === branchSlug) ??
    branches.find((b) => b.isPrimary) ??
    branches[0];

  const config = data.config;
  const now = new Date();

  const todaySlots = (() => {
    if (!isActiveBusiness) return [];
    const haircut = ALL_SERVICES.find(
      (s) => s.branchIds.includes(branch.id) && s.category === "hair"
    );
    if (!haircut) return [];
    return availableSlotsAnyStaff(data, branch.id, new Date(), [haircut.id]);
  })();

  // This demo keeps one scenario's world live at a time. Visiting another
  // business's page offers an explicit switch instead of surprise-reseeding.
  if (!isActiveBusiness) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sidebar font-heading text-xl font-semibold text-sidebar-primary">
          {business.logoInitial}
        </span>
        <h1 className="mt-4 font-heading text-2xl font-semibold">{business.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{business.tagline}</p>
        <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
          This shop lives in a different demo scenario. Switch the demo to{" "}
          {business.name} to browse its live page.
        </p>
        <Button
          className="mt-5 h-11"
          onClick={() => {
            setScenario(BUSINESS_SCENARIO[business.id] ?? "premium");
            toast.success(`Demo switched to ${business.name}`);
          }}
        >
          <ArrowLeftRight className="size-4" aria-hidden />
          Switch demo to this shop
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          or go back to the <Link href="/demo" className="underline">demo picker</Link>
        </p>
      </div>
    );
  }

  const branchStaff = staffForBranch(data, branch.id, { activeOn: now });
  const reviews = data.reviews
    .filter((r) => r.branchId === branch.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 10);

  const dow = now.getDay();
  const hoursToday = branch.hours.find((h) => h.day === dow);
  const bookHref = `/shops/${business.slug}/book?branch=${branch.slug}`;
  const telHref = `tel:${branch.phone.replace(/\s/g, "")}`;
  const waHref = `https://wa.me/${branch.whatsapp.replace(/[^\d]/g, "")}`;

  const canBookOnline =
    config.bookingMode === "online_instant" || config.bookingMode === "online_request";
  const bookCta =
    config.bookingMode === "online_request"
      ? "Request booking"
      : t("shop.bookNow", lang);
  // 'shop' assigns barbers privately — staff identities stay off the page.
  const showStaffTab = config.staffSelection !== "shop";

  const queue = queueForBranch(data, branch.id, now);
  const queueLen = queue.waiting.length;
  const waitMin =
    queue.waiting.length > 0
      ? Math.max(...queue.waiting.map((a) => a.estimatedWaitMin ?? 10))
      : 0;

  const joinQueue = () => {
    const svc = ALL_SERVICES.find(
      (s) => s.branchIds.includes(branch.id) && s.category === "hair"
    );
    const appt = addWalkIn({
      branchId: branch.id,
      staffId: null,
      serviceIds: svc ? [svc.id] : [],
      walkInName: queueName.trim() || "Walk-in Guest",
    });
    setJoinedId(appt.id);
    toast.success("You're in the queue", {
      description: "Show this page at the counter when you arrive.",
    });
  };

  const tabs = (
    [
      ["services", t("shop.services", lang)],
      ...(showStaffTab ? [["staff", t("shop.staff", lang)] as const] : []),
      ...(reviews.length > 0 ? [["reviews", t("shop.reviews", lang)] as const] : []),
    ] as Array<readonly [ShopTab, string]>
  );

  return (
    <div className="pb-28">
      {/* Hero */}
      <div className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-3xl px-4 pt-8 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl font-semibold text-sidebar-accent-foreground">
                {business.name}
              </h1>
              <p className="mt-0.5 text-sm text-sidebar-foreground/80">
                {business.tagline}
              </p>
            </div>
            <LanguageToggle className="bg-sidebar-accent/50 border-sidebar-border" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            {business.ratingCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-warning text-warning" aria-hidden />
                <strong className="text-sidebar-accent-foreground">
                  {business.ratingAverage}
                </strong>
                <span className="text-sidebar-foreground/70">
                  ({business.ratingCount.toLocaleString("en-IN")})
                </span>
              </span>
            )}
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

          {/* Branch picker (multi-branch businesses only) */}
          {branches.length > 1 && (
            <div className="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar">
              {branches.map((b) => (
                <Link
                  key={b.id}
                  href={`/shops/${business.slug}?branch=${b.slug}` as "/"}
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
          )}

          {/* Mode-aware primary actions */}
          {config.bookingMode === "staff_only" ? (
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-2">
                <Button size="lg" className="h-12" asChild>
                  <a href={telHref}>
                    <Phone className="size-4" aria-hidden />
                    Call to book
                  </a>
                </Button>
                <Button size="lg" variant="secondary" className="h-12" asChild>
                  <a href={waHref} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" aria-hidden />
                    WhatsApp
                  </a>
                </Button>
              </div>
              <p className="mt-2.5 text-xs text-sidebar-foreground/70">
                {business.name} takes bookings by phone or WhatsApp — walk-ins
                welcome.
              </p>
            </div>
          ) : config.bookingMode === "walk_in_only" ? (
            <div className="mt-5 rounded-2xl bg-sidebar-accent/50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-sidebar-accent-foreground">
                <Footprints className="size-4" aria-hidden />
                Walk-in shop — no appointments
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-sidebar-foreground/80">
                <Users className="size-3.5" aria-hidden />
                {queueLen === 0
                  ? "No one waiting right now"
                  : `${queueLen} waiting · about ${waitMin} min`}
              </p>
              {config.remoteQueueJoin && !joinedId && (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={queueName}
                    onChange={(e) => setQueueName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 border-sidebar-border bg-sidebar text-sidebar-foreground placeholder:text-sidebar-foreground/50"
                  />
                  <Button className="h-11 shrink-0" onClick={joinQueue}>
                    Join queue
                  </Button>
                </div>
              )}
              {joinedId && (
                <p className="mt-3 rounded-xl bg-sidebar px-3 py-2 text-xs font-medium text-sidebar-primary">
                  You&apos;re in — position {queueLen} in the queue.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Button variant="secondary" size="sm" asChild>
                <a href={telHref}>
                  <Phone className="size-4" aria-hidden />
                  Call
                </a>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <a href={waHref} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </a>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${business.name} ${branch.address.locality} ${branch.address.city}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin className="size-4" aria-hidden />
                  Map
                </a>
              </Button>
            </div>
          )}

          {canBookOnline && todaySlots.length > 0 && (
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
          {tabs.map(([key, label]) => (
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
            {ALL_SERVICES.filter((s) => s.branchIds.includes(branch.id)).map((svc) => {
              const inner = (
                <>
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
                    <p className="font-heading text-base font-semibold">
                      {inr(svc.price)}
                    </p>
                    {canBookOnline && (
                      <span className="text-xs font-medium text-primary">
                        {bookCta} →
                      </span>
                    )}
                  </div>
                </>
              );
              return canBookOnline ? (
                <Link
                  key={svc.id}
                  href={`${bookHref}&services=${svc.id}` as "/"}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={svc.id}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-4"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        )}

        {tab === "staff" && showStaffTab && (
          <div className="grid gap-2">
            {branchStaff.map((staff) => (
              <div key={staff.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {staff.name}
                    {staff.ratingCount > 0 && <StarRating rating={staff.rating} size="xs" />}
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
                {canBookOnline && config.staffSelection === "customer" && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`${bookHref}&staff=${staff.id}` as "/"}>Book</Link>
                  </Button>
                )}
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
                      <strong>{business.name}:</strong> {review.response}
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
            In the shop? Scan the counter QR to open this page —{" "}
            {config.bookingMode === "walk_in_only"
              ? "join the queue and watch your turn."
              : canBookOnline
                ? "book, pay or review."
                : "see prices and call to book."}
          </p>
        </div>
      </div>

      {/* Sticky mode-aware CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur pb-safe">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {business.name} · {branch.name}
            </p>
            <p className="text-sm font-medium">
              {config.bookingMode === "walk_in_only"
                ? queueLen === 0
                  ? "No wait right now"
                  : `~${waitMin} min wait`
                : config.bookingMode === "staff_only"
                  ? "Bookings by phone"
                  : todaySlots.length > 0
                    ? `${todaySlots.length}+ slots today`
                    : "Book for tomorrow"}
            </p>
          </div>
          {config.bookingMode === "staff_only" ? (
            <div className="flex gap-2">
              <Button size="lg" className="h-12 px-5" asChild>
                <a href={telHref}>
                  <Phone className="size-4" aria-hidden />
                  Call
                </a>
              </Button>
              <Button size="lg" variant="secondary" className="h-12 px-4" asChild>
                <a href={waHref} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden />
                </a>
              </Button>
            </div>
          ) : config.bookingMode === "walk_in_only" ? (
            config.remoteQueueJoin && !joinedId ? (
              <Button size="lg" className="h-12 px-6" onClick={joinQueue}>
                Join queue
              </Button>
            ) : (
              <Button size="lg" variant="secondary" className="h-12 px-6" asChild>
                <a href={telHref}>
                  <Phone className="size-4" aria-hidden />
                  Call
                </a>
              </Button>
            )
          ) : (
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href={bookHref as "/"}>{bookCta}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
