"use client";

// Mounted once in the root layout: registers the service worker (production
// only — dev builds churn too much for a SW to help) and importing lib/pwa
// arms the beforeinstallprompt capture before the event can fire.

import { useEffect } from "react";
import { toast } from "sonner";
import "@/lib/pwa";

export function PwaClient() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration failure just means no offline shell — never block UI */
    });
  }, []);

  useEffect(() => {
    const onInstalled = () =>
      toast.success("App installed", {
        description: "Find it on your home screen.",
      });
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  return null;
}
