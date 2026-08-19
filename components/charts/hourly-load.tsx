"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  count: { label: "Bookings", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function HourlyLoadChart({
  data,
  className,
}: {
  data: Array<{ label: string; count: number }>;
  className?: string;
}) {
  return (
    <ChartContainer config={config} className={className ?? "h-48 w-full"}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ChartContainer>
  );
}
