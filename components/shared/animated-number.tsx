"use client";

import { useEffect, useRef, useState } from "react";

/** Counts up smoothly when the value changes. Respects reduced motion. */
export function AnimatedNumber({
  value,
  format,
  durationMs = 600,
}: {
  value: number;
  format?: (n: number) => string;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      if (reduced) {
        setDisplay(value);
        return;
      }
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  const rounded = Math.round(display);
  return <span className="tabular-nums">{format ? format(rounded) : rounded.toLocaleString("en-IN")}</span>;
}
