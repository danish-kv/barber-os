// Horizontal labeled bar list — mobile-friendly alternative to bar charts
// for rankings (popular services, staff revenue, expense categories).

import { cn } from "@/lib/utils";

export function BarList({
  items,
  formatValue,
  className,
  color = "var(--chart-1)",
}: {
  items: Array<{ label: string; value: number; hint?: string }>;
  formatValue: (v: number) => string;
  className?: string;
  color?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className={cn("grid gap-2.5", className)}>
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium">{item.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatValue(item.value)}
              {item.hint && (
                <span className="ml-1.5 text-xs">· {item.hint}</span>
              )}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
