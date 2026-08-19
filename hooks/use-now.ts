"use client";

import { useEffect, useState } from "react";

/** A Date that refreshes on an interval — keeps "time remaining" labels live
 * without impure Date.now() calls during render. */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
