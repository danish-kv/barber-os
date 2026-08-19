"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/store";
import { historyForCustomer, serviceNames, staffById } from "@/lib/selectors";
import { dayLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const CUSTOMER_ID = "cu_danish";

export default function CustomerReviewsPage() {
  const data = useDemoStore((s) => s.data);
  const pushNotification = useDemoStore((s) => s.pushNotification);

  const myReviews = data.reviews.filter((r) => r.customerId === CUSTOMER_ID);
  const completed = historyForCustomer(data, CUSTOMER_ID).filter(
    (a) => a.status === "completed"
  );
  const reviewedApptIds = new Set(myReviews.map((r) => r.appointmentId));
  const pending = completed.filter((a) => !reviewedApptIds.has(a.id)).slice(0, 3);

  const [reviewFor, setReviewFor] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState<string[]>([]);

  const target = pending.find((a) => a.id === reviewFor);

  const submit = () => {
    if (!reviewFor) return;
    setSubmitted((prev) => [...prev, reviewFor]);
    pushNotification({
      role: "owner",
      category: "system",
      title: `New ${rating}★ review from Danish`,
      body: comment || "No comment left.",
      actionLabel: "View reviews",
      actionHref: "/owner/reviews",
    });
    toast.success("Review submitted", { description: "Thanks for the feedback!" });
    setReviewFor(null);
    setRating(5);
    setComment("");
  };

  const toReview = pending.filter((a) => !submitted.includes(a.id));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">My reviews</h1>

      {toReview.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Rate your recent visits
          </h2>
          <div className="grid gap-2">
            {toReview.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{serviceNames(a.serviceIds)}</p>
                  <p className="text-xs text-muted-foreground">
                    {staffById(a.staffId)?.name} · {dayLabel(a.start)}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setReviewFor(a.id)}>
                  <Star className="size-4" aria-hidden />
                  Rate
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Past reviews
        </h2>
        {myReviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="After your next visit we'll ask how it went."
          />
        ) : (
          <div className="grid gap-2">
            {myReviews.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-1" aria-label={`${r.ratingOverall} stars`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3.5",
                        i <= r.ratingOverall
                          ? "fill-warning text-warning"
                          : "text-muted-foreground/30"
                      )}
                      aria-hidden
                    />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {dayLabel(r.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm">&ldquo;{r.comment}&rdquo;</p>
                {r.response && (
                  <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    <strong>Royal Cuts:</strong> {r.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <BottomSheet
        open={reviewFor !== null}
        onOpenChange={(o) => !o && setReviewFor(null)}
        title="Rate your visit"
        description={
          target
            ? `${serviceNames(target.serviceIds)} with ${staffById(target.staffId)?.name ?? "us"}`
            : undefined
        }
      >
        <div className="grid gap-4 pb-4">
          <div className="flex justify-center gap-2" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                role="radio"
                aria-checked={rating === i}
                aria-label={`${i} star${i > 1 ? "s" : ""}`}
                onClick={() => setRating(i)}
                className="p-1"
              >
                <Star
                  className={cn(
                    "size-8 transition-colors",
                    i <= rating ? "fill-warning text-warning" : "text-muted-foreground/30"
                  )}
                  aria-hidden
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="How was it? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <Button size="lg" onClick={submit}>
            Submit review
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
