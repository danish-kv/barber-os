import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AnimatedNumber } from "./animated-number";

export function MetricCard({
  label,
  value,
  format,
  delta,
  deltaLabel,
  hint,
  className,
  compact,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  /** positive = good (green), negative = bad (red) */
  delta?: number;
  deltaLabel?: string;
  hint?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-xs",
        compact && "p-3",
        className
      )}
    >
      <p className={cn("text-muted-foreground text-xs font-medium uppercase tracking-wide", compact && "text-[11px]")}>
        {label}
      </p>
      <p className={cn("mt-1 font-heading font-semibold text-foreground", compact ? "text-xl" : "text-2xl md:text-[1.7rem]")}>
        <AnimatedNumber value={value} format={format} />
      </p>
      {(delta !== undefined || hint) && (
        <p className="mt-1 flex items-center gap-1 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                delta >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {delta >= 0 ? (
                <ArrowUpRight className="size-3" aria-hidden />
              ) : (
                <ArrowDownRight className="size-3" aria-hidden />
              )}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          <span className="text-muted-foreground">{deltaLabel ?? hint}</span>
        </p>
      )}
    </div>
  );
}
