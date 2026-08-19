import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = "sm",
  showValue = true,
  className,
}: {
  rating: number;
  size?: "xs" | "sm" | "md";
  showValue?: boolean;
  className?: string;
}) {
  const sz = size === "xs" ? "size-3" : size === "sm" ? "size-3.5" : "size-4";
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star className={cn(sz, "fill-warning text-warning")} aria-hidden />
      {showValue && (
        <span className="text-sm font-medium tabular-nums">{rating.toFixed(1)}</span>
      )}
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
    </span>
  );
}
