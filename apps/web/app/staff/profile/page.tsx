"use client";

import { Clock, Scissors, Star } from "lucide-react";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { useDemoStore } from "@/lib/store";
import { STAFF, SERVICES } from "@/lib/data/seed-static";
import { cn } from "@/lib/utils";

const STAFF_ID = "st_akhil";
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StaffProfilePage() {
  const data = useDemoStore((s) => s.data);
  const staff = STAFF.find((s) => s.id === STAFF_ID)!;

  const myReviews = data.reviews
    .filter((r) => r.staffId === STAFF_ID)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>

      <section className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <ToneAvatar name={staff.name} toneName={staff.avatarTone} size="xl" />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold">{staff.name}</p>
          <p className="text-sm text-muted-foreground">
            {staff.title} · {staff.experienceYears} yrs experience
          </p>
          <p className="mt-1 flex items-center gap-1.5">
            <StarRating rating={staff.rating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({staff.ratingCount} ratings)
            </span>
          </p>
        </div>
      </section>

      {staff.bio && (
        <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
          {staff.bio}
        </p>
      )}

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          <Scissors className="size-3.5" aria-hidden />
          Services you offer
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {staff.serviceIds.map((id) => {
            const svc = SERVICES.find((s) => s.id === id);
            return (
              <span
                key={id}
                className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium"
              >
                {svc?.name}
              </span>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          <Clock className="size-3.5" aria-hidden />
          Working hours
        </h2>
        <ul className="overflow-hidden rounded-2xl border bg-card">
          {staff.workingHours.map((wh, i) => (
            <li
              key={wh.day}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 text-sm",
                i > 0 && "border-t"
              )}
            >
              <span className={cn("font-medium", wh.off && "text-muted-foreground")}>
                {DOW[wh.day]}
              </span>
              <span className={cn(wh.off ? "text-muted-foreground" : "tabular-nums")}>
                {wh.off ? "Off" : `${wh.start} – ${wh.end}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {myReviews.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <Star className="size-3.5" aria-hidden />
            Recent feedback
          </h2>
          <div className="grid gap-2">
            {myReviews.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-card p-4">
                <StarRating rating={r.ratingOverall} size="xs" />
                <p className="mt-1.5 text-sm">&ldquo;{r.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
