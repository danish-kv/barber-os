import { cn } from "@/lib/utils";

/** Sticky bottom action bar for mobile flows. Sits above bottom nav if present. */
export function StickyCta({
  children,
  className,
  aboveNav = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** true when the persona shell renders a bottom nav underneath */
  aboveNav?: boolean;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85",
        aboveNav ? "bottom-16" : "bottom-0 pb-safe",
        className
      )}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
        {children}
      </div>
    </div>
  );
}
