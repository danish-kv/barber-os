"use client";

// Staff performance — cards on mobile, table on desktop.

import Link from "next/link";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { StarRating } from "@/components/shared/star-rating";
import type { StaffPerformance } from "@/lib/selectors";
import { inr, percent } from "@/lib/format";

export function StaffPerformanceList({
  performance,
  linkBase,
}: {
  performance: StaffPerformance[];
  linkBase?: string; // e.g. "/owner/staff" — makes rows clickable
}) {
  const Row = ({ p }: { p: StaffPerformance }) => {
    const inner = (
      <>
        <ToneAvatar name={p.staff.name} toneName={p.staff.avatarTone} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            {p.staff.name}
            <StarRating rating={p.staff.rating} size="xs" />
          </p>
          <p className="text-xs text-muted-foreground">
            {p.services} services · {inr(p.revenue, { compact: true })} revenue
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums">{inr(p.commission, { compact: true })}</p>
          <p className="text-[11px] text-muted-foreground">
            {percent(p.utilization)} utilized
          </p>
        </div>
      </>
    );
    return linkBase ? (
      <Link
        href={`${linkBase}/${p.staff.id}` as "/"}
        className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors hover:bg-muted/40"
      >
        {inner}
      </Link>
    ) : (
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-3.5">{inner}</div>
    );
  };

  return (
    <>
      {/* Mobile cards */}
      <ul className="grid gap-2 lg:hidden">
        {performance.map((p) => (
          <li key={p.staff.id}>
            <Row p={p} />
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border lg:block">
        <table className="w-full border-collapse bg-card text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th scope="col" className="p-3 font-medium">Staff</th>
              <th scope="col" className="p-3 text-right font-medium">Services</th>
              <th scope="col" className="p-3 text-right font-medium">Revenue</th>
              <th scope="col" className="p-3 text-right font-medium">Avg ticket</th>
              <th scope="col" className="p-3 text-right font-medium">Commission</th>
              <th scope="col" className="p-3 text-right font-medium">Utilization</th>
              <th scope="col" className="p-3 text-right font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {performance.map((p) => (
              <tr key={p.staff.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  {linkBase ? (
                    <Link
                      href={`${linkBase}/${p.staff.id}` as "/"}
                      className="flex items-center gap-2.5 font-medium hover:underline"
                    >
                      <ToneAvatar name={p.staff.name} toneName={p.staff.avatarTone} size="xs" />
                      {p.staff.name}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2.5 font-medium">
                      <ToneAvatar name={p.staff.name} toneName={p.staff.avatarTone} size="xs" />
                      {p.staff.name}
                    </span>
                  )}
                </td>
                <td className="p-3 text-right tabular-nums">{p.services}</td>
                <td className="p-3 text-right font-medium tabular-nums">{inr(p.revenue)}</td>
                <td className="p-3 text-right tabular-nums">{inr(p.avgTicket)}</td>
                <td className="p-3 text-right tabular-nums">{inr(p.commission)}</td>
                <td className="p-3 text-right tabular-nums">{percent(p.utilization)}</td>
                <td className="p-3 text-right">
                  <StarRating rating={p.staff.rating} size="xs" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
