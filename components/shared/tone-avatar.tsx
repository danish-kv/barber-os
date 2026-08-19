import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { tone } from "./tone";

export function ToneAvatar({
  name,
  toneName,
  size = "md",
  className,
}: {
  name: string;
  toneName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const t = tone(toneName);
  const sizes = {
    xs: "size-6 text-[10px]",
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-12 text-base",
    xl: "size-16 text-lg",
  };
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizes[size],
        t.bg,
        t.text,
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
