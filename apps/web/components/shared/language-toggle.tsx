"use client";

import { useDemoStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const lang = useDemoStore((s) => s.session.language);
  const setLanguage = useDemoStore((s) => s.setLanguage);

  return (
    <div
      className={cn(
        "flex items-center rounded-full border bg-card p-0.5 text-xs font-medium",
        className
      )}
      role="group"
      aria-label="Language"
    >
      <button
        onClick={() => setLanguage("en")}
        aria-pressed={lang === "en"}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        )}
      >
        En
      </button>
      <button
        onClick={() => setLanguage("ml")}
        aria-pressed={lang === "ml"}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          lang === "ml" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        )}
      >
        മ
      </button>
    </div>
  );
}
