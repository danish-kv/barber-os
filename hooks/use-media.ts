"use client";

import { useSyncExternalStore } from "react";

const subscribers = new Map<string, MediaQueryList>();

function getQuery(query: string) {
  let mq = subscribers.get(query);
  if (!mq && typeof window !== "undefined") {
    mq = window.matchMedia(query);
    subscribers.set(query, mq);
  }
  return mq;
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = getQuery(query);
      mq?.addEventListener("change", onChange);
      return () => mq?.removeEventListener("change", onChange);
    },
    () => getQuery(query)?.matches ?? false,
    () => false
  );
}

export function useIsDesktop(breakpoint = 768) {
  return useMediaQuery(`(min-width: ${breakpoint}px)`);
}
