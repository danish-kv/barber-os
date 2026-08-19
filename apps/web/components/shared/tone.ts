// Warm, muted identity tones used for avatars and calendar lanes.
export const TONE_CLASSES: Record<string, { bg: string; text: string; solid: string; border: string }> = {
  amber: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-800 dark:text-amber-300", solid: "bg-amber-600", border: "border-amber-300 dark:border-amber-800" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-800 dark:text-emerald-300", solid: "bg-emerald-600", border: "border-emerald-300 dark:border-emerald-800" },
  clay: { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-800 dark:text-orange-300", solid: "bg-orange-700", border: "border-orange-300 dark:border-orange-800" },
  ink: { bg: "bg-stone-200 dark:bg-stone-800", text: "text-stone-800 dark:text-stone-200", solid: "bg-stone-700", border: "border-stone-300 dark:border-stone-700" },
  gold: { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-800 dark:text-yellow-300", solid: "bg-yellow-600", border: "border-yellow-300 dark:border-yellow-800" },
  sage: { bg: "bg-lime-100 dark:bg-lime-950", text: "text-lime-800 dark:text-lime-300", solid: "bg-lime-700", border: "border-lime-300 dark:border-lime-800" },
  rose: { bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-800 dark:text-rose-300", solid: "bg-rose-600", border: "border-rose-300 dark:border-rose-800" },
  slate: { bg: "bg-slate-200 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", solid: "bg-slate-600", border: "border-slate-300 dark:border-slate-700" },
};

export function tone(name: string) {
  return TONE_CLASSES[name] ?? TONE_CLASSES.slate;
}
