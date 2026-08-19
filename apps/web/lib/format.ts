import { format, isToday, isTomorrow, isYesterday } from "date-fns";

export function inr(amount: number, opts?: { compact?: boolean }) {
  if (opts?.compact && Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (opts?.compact && Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function timeLabel(iso: string | Date) {
  return format(new Date(iso), "h:mm a");
}

export function dayLabel(iso: string | Date) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "d MMM");
}

export function dateTimeLabel(iso: string | Date) {
  return `${dayLabel(iso)} · ${timeLabel(iso)}`;
}

export function durationLabel(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function percent(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}
