"use client";

import Link from "next/link";
import {
  BadgePercent,
  CalendarPlus,
  ChevronRight,
  Gift,
  ListPlus,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { CustomerAppointmentCard } from "@/components/customer/appointment-card";
import { useDemoStore } from "@/lib/store";
import {
  historyForCustomer,
  serviceNames,
  staffById,
  upcomingForCustomer,
} from "@/lib/selectors";
import { MEMBERSHIP_PLANS, SERVICES } from "@/lib/data/seed-static";
import { dayLabel, inr } from "@/lib/format";
import { t } from "@/lib/i18n";

const CUSTOMER_ID = "cu_danish";

export default function CustomerHome() {
  const data = useDemoStore((s) => s.data);
  const lang = useDemoStore((s) => s.session.language);

  const customer = data.customers.find((c) => c.id === CUSTOMER_ID)!;
  const upcoming = upcomingForCustomer(data, CUSTOMER_ID);
  const history = historyForCustomer(data, CUSTOMER_ID).filter(
    (a) => a.status === "completed"
  );
  const lastVisit = history[0];
  const loyalty = data.loyaltyAccounts.find((l) => l.customerId === CUSTOMER_ID);
  const membership = data.memberships.find(
    (m) => m.customerId === CUSTOMER_ID && m.status === "active"
  );
  const plan = membership
    ? MEMBERSHIP_PLANS.find((p) => p.id === membership.planId)
    : undefined;
  const offers = data.offers.filter((o) => o.active).slice(0, 3);
  const preferredStaff = staffById(customer.preferredStaffId);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("home.greetingMorning", lang)
      : hour < 17
        ? t("home.greetingAfternoon", lang)
        : t("home.greetingEvening", lang);

  const pointsToReward = loyalty ? 100 - (loyalty.points % 100) : 0;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {greeting}, {customer.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Royal Cuts · Kakkanad{" "}
          <span className="text-success">· {t("shop.openToday", lang)} 10 AM – 8 PM</span>
        </p>
      </div>

      {/* Next appointment */}
      {upcoming.length > 0 ? (
        <section aria-label={t("home.nextAppointment", lang)}>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t("home.nextAppointment", lang)}
          </h2>
          <CustomerAppointmentCard appointment={upcoming[0]} highlight />
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed bg-card p-5 text-center">
          <p className="text-sm font-medium">No upcoming appointment</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your usual? {lastVisit ? serviceNames(lastVisit.serviceIds) : "Haircut + Beard"} with{" "}
            {preferredStaff?.name ?? "Akhil"}
          </p>
          <Button className="mt-3" asChild>
            <Link href="/shops/royal-cuts/book">{t("shop.bookNow", lang)}</Link>
          </Button>
        </section>
      )}

      {/* Quick actions */}
      <section aria-label="Quick actions" className="grid grid-cols-4 gap-2">
        {[
          { icon: RotateCcw, label: t("home.bookAgain", lang), href: "/customer/bookings?rebook=1" },
          { icon: ListPlus, label: t("home.joinQueue", lang), href: "/shops/royal-cuts?queue=1" },
          { icon: Search, label: t("home.explore", lang), href: "/customer/explore" },
          { icon: BadgePercent, label: t("home.offers", lang), href: "/customer/offers" },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href as "/"}
            className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card p-2 text-center shadow-xs transition-all hover:shadow-md active:scale-95"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <a.icon className="size-4.5" aria-hidden />
            </span>
            <span className="text-[11px] leading-tight font-medium">{a.label}</span>
          </Link>
        ))}
      </section>

      {/* Rebook last visit */}
      {lastVisit && (
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t("home.bookAgain", lang)}
          </h2>
          <Link
            href={
              `/shops/royal-cuts/book?services=${lastVisit.serviceIds.join(",")}&staff=${lastVisit.staffId ?? ""}` as "/"
            }
            className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-xs transition-all hover:shadow-md active:scale-[0.995]"
          >
            {staffById(lastVisit.staffId) && (
              <ToneAvatar
                name={staffById(lastVisit.staffId)!.name}
                toneName={staffById(lastVisit.staffId)!.avatarTone}
                size="md"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{serviceNames(lastVisit.serviceIds)}</p>
              <p className="text-xs text-muted-foreground">
                {staffById(lastVisit.staffId)?.name} · Last visit{" "}
                {dayLabel(lastVisit.start)}
              </p>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-primary">
              Rebook
              <ChevronRight className="size-4" aria-hidden />
            </span>
          </Link>
        </section>
      )}

      {/* Loyalty + membership row */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/customer/loyalty"
          className="rounded-2xl border bg-sidebar p-4 text-sidebar-foreground shadow-xs transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-sidebar-primary uppercase">
              <Gift className="size-3.5" aria-hidden />
              Royal Rewards
            </p>
            <ChevronRight className="size-4 text-sidebar-foreground/50" aria-hidden />
          </div>
          <p className="mt-2 font-heading text-2xl font-semibold text-sidebar-accent-foreground">
            {loyalty?.points ?? 0} <span className="text-sm font-normal">points</span>
          </p>
          <Progress
            value={loyalty ? ((loyalty.points % 100) / 100) * 100 : 0}
            className="mt-3 h-1.5 bg-sidebar-accent"
          />
          <p className="mt-2 text-xs text-sidebar-foreground/70">
            {pointsToReward} points until {inr(100)} reward
          </p>
        </Link>

        <Link
          href="/customer/memberships"
          className="rounded-2xl border bg-card p-4 shadow-xs transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
              <Sparkles className="size-3.5" aria-hidden />
              {t("home.membership", lang)}
            </p>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </div>
          {membership && plan ? (
            <>
              <p className="mt-2 text-sm font-semibold">{plan.name}</p>
              <div className="mt-2 grid gap-1.5">
                {plan.includedServices.slice(0, 2).map((inc) => {
                  const svc = SERVICES.find((s) => s.id === inc.serviceId);
                  const used = membership.usage[inc.serviceId] ?? 0;
                  return (
                    <div key={inc.serviceId} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{svc?.name}</span>
                      <span className="font-medium tabular-nums">
                        {used} / {inc.qty} used
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-success">Active · renews {dayLabel(membership.renewsAt)}</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm font-medium">Save with a membership</p>
              <p className="mt-1 text-xs text-muted-foreground">
                From ₹999/month — includes 4 haircuts + 4 beard trims
              </p>
            </>
          )}
        </Link>
      </section>

      {/* Preferred barber */}
      {preferredStaff && (
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Your barber
          </h2>
          <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-xs">
            <ToneAvatar
              name={preferredStaff.name}
              toneName={preferredStaff.avatarTone}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {preferredStaff.name}
                <StarRating rating={preferredStaff.rating} size="xs" />
              </p>
              <p className="text-xs text-muted-foreground">
                {preferredStaff.title} · {history.filter((h) => h.staffId === preferredStaff.id).length}{" "}
                visits with you
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/shops/royal-cuts/book?staff=${preferredStaff.id}` as "/"}>
                <CalendarPlus className="size-4" aria-hidden />
                Book
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Offers for you */}
      {offers.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {t("home.offers", lang)} for you
            </h2>
            <Link href="/customer/offers" className="text-xs font-medium text-primary">
              View all
            </Link>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
            {offers.map((offer) => (
              <Link
                key={offer.id}
                href="/customer/offers"
                className="min-w-60 shrink-0 rounded-2xl border bg-linear-to-br from-accent/60 to-card p-4 shadow-xs"
              >
                <p className="text-sm font-semibold">{offer.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {offer.description}
                </p>
                <p className="mt-2 text-xs font-semibold text-primary">
                  {offer.offerPrice
                    ? `${inr(offer.originalPrice ?? 0)} → ${inr(offer.offerPrice)}`
                    : offer.discountPercent
                      ? `${offer.discountPercent}% off`
                      : `Code ${offer.code}`}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent visits */}
      {history.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Recent visits
            </h2>
            <Link href="/customer/bookings" className="text-xs font-medium text-primary">
              View all
            </Link>
          </div>
          <div className="grid gap-2">
            {history.slice(0, 3).map((appt) => (
              <CustomerAppointmentCard key={appt.id} appointment={appt} />
            ))}
          </div>
        </section>
      )}

      {/* Favorite shop */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Your shop
        </h2>
        <Link
          href="/shops/royal-cuts"
          className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-xs transition-all hover:shadow-md"
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-sidebar font-heading text-lg font-semibold text-sidebar-primary">
            R
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold">
              Royal Cuts
              <span className="inline-flex items-center gap-0.5 text-xs font-medium">
                <Star className="size-3 fill-warning text-warning" aria-hidden /> 4.8
              </span>
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" aria-hidden />
              Kakkanad, Kochi · 2.1 km
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
