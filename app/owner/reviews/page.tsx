"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquareReply, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { customerById, reviewSummary, staffById, branchById } from "@/lib/selectors";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function OwnerReviewsPage() {
  const data = useDemoStore((s) => s.data);
  const branchFilter = useDemoStore((s) => s.session.ownerBranchFilter);
  const respondToReview = useDemoStore((s) => s.respondToReview);

  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const summary = reviewSummary(data, branchFilter);
  const reviews = data.reviews
    .filter((r) => branchFilter === "all" || r.branchId === branchFilter)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 30);

  const target = reviews.find((r) => r.id === replyFor);

  const sendReply = () => {
    if (!replyFor || !replyText.trim()) return;
    respondToReview(replyFor, replyText.trim());
    toast.success("Response published");
    setReplyFor(null);
    setReplyText("");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Reviews" description={`${summary.count} reviews`} />

      {/* Summary */}
      <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center sm:pr-6 sm:border-r">
          <p className="font-heading text-5xl font-semibold">{summary.overall}</p>
          <div className="mt-1 flex gap-0.5" aria-hidden>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "size-4",
                  i <= Math.round(summary.overall)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{summary.count} reviews</p>
        </div>
        <div className="grid content-center gap-2">
          {(
            [
              ["Service", summary.service],
              ["Cleanliness", summary.cleanliness],
              ["Wait time", summary.wait],
              ["Staff", summary.staff],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-24 text-sm text-muted-foreground">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-warning"
                  style={{ width: `${(value / 5) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-medium tabular-nums">
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* List */}
      <section className="grid gap-3">
        {reviews.map((review) => {
          const customer = customerById(data, review.customerId);
          const staff = staffById(review.staffId);
          return (
            <div key={review.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-3">
                {customer && (
                  <ToneAvatar name={customer.name} toneName={customer.avatarTone} size="sm" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold">
                    {customer?.name}
                    <span className="flex gap-0.5" aria-label={`${review.ratingOverall} stars`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3",
                            i <= review.ratingOverall
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                          )}
                          aria-hidden
                        />
                      ))}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {staff && `${staff.name} · `}
                    {branchById(review.branchId)?.name} · {relativeTime(review.createdAt)}
                  </p>
                  <p className="mt-2 text-sm">&ldquo;{review.comment}&rdquo;</p>
                  {review.response ? (
                    <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-xs">
                      <strong>Your reply:</strong> {review.response}
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 -ml-2 h-8 text-primary"
                      onClick={() => setReplyFor(review.id)}
                    >
                      <MessageSquareReply className="size-3.5" aria-hidden />
                      Respond
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <BottomSheet
        open={replyFor !== null}
        onOpenChange={(o) => !o && setReplyFor(null)}
        title="Respond to review"
        description={target ? `"${target.comment.slice(0, 80)}…"` : undefined}
      >
        <div className="grid gap-3 pb-4">
          <Textarea
            placeholder="Thank you for the feedback…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
          />
          <Button onClick={sendReply} disabled={!replyText.trim()}>
            Publish response
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
