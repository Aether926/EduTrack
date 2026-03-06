"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { GraduationCap } from "lucide-react";

type MonthPoint = { month: string; hours: number };
type View = "week" | "month" | "year";

// Hard-coded hex values — no CSS variables, no slash syntax.
// These are safe to use directly in SVG fill attributes.
const ACTIVE = "#38bdf8";   // sky-400, clearly visible on dark bg
const DIM    = "#38bdf828"; // sky-400 at ~16% opacity (hex alpha)

const chartConfig = {
    hours: { label: "Hours", color: ACTIVE },
} satisfies ChartConfig;

function deriveWeekly(monthly: MonthPoint[]) {
    // Last 6 months × 4 weeks = 24 bars
    return monthly.slice(-6).flatMap((m) =>
        [1, 2, 3, 4].map((w) => ({
            label: `${m.month.split(" ")[0]} W${w}`, // "Mar W1"
            hours: Math.round(m.hours / 4),
        }))
    );
}

function deriveYearly(monthly: MonthPoint[]) {
    const map = new Map<string, number>();
    monthly.forEach((m) => {
        // m.month is like "Mar 25" — expand "25" → "2025"
        const shortYear = m.month.split(" ")[1] ?? "00";
        const fullYear  = `20${shortYear}`;
        map.set(fullYear, (map.get(fullYear) ?? 0) + m.hours);
    });

    // Ensure at least 5 years are shown (pad missing years with 0)
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 4; y <= currentYear; y++) {
        const key = String(y);
        if (!map.has(key)) map.set(key, 0);
    }

    // Return sorted by year
    return Array.from(map.entries())
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([label, hours]) => ({ label, hours }));
}

const VIEW_LABEL: Record<View, string> = {
    week:  "Last 3 months by week",
    month: "Last 12 months by month",
    year:  "All time by year",
};

export default function TrainingHoursChart({
    trainingHoursPerMonth,
}: {
    trainingHoursPerMonth: MonthPoint[];
}) {
    const [view, setView] = useState<View>("month");

    const data = useMemo(() => {
        if (view === "week")  return deriveWeekly(trainingHoursPerMonth);
        if (view === "year")  return deriveYearly(trainingHoursPerMonth);
        return trainingHoursPerMonth.map((m) => ({ label: m.month, hours: m.hours }));
    }, [view, trainingHoursPerMonth]);

    const maxHours   = Math.max(...data.map((d) => d.hours), 1);
    const totalHours = data.reduce((s, d) => s + d.hours, 0);

    return (
        <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2 px-5 pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" style={{ color: ACTIVE }} />
                            Training Hours Rendered
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {VIEW_LABEL[view]}
                        </CardDescription>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5 self-start shrink-0">
                        {(["week", "month", "year"] as View[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={[
                                    "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all duration-150",
                                    view === v
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground",
                                ].join(" ")}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: ACTIVE }}>
                        {totalHours.toLocaleString()}h
                    </span>
                    <span className="text-xs text-muted-foreground">total approved</span>
                </div>
            </CardHeader>

            <CardContent className="px-2 pb-4 pt-2">
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                        barCategoryGap="30%"
                    >
                        <CartesianGrid
                            vertical={false}
                            stroke="hsl(var(--border))"
                            strokeOpacity={0.4}
                        />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            interval={view === "week" ? 3 : 0}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <ChartTooltip
                            cursor={{ fill: "hsl(var(--accent))", opacity: 0.3, radius: 4 }}
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => (
                                        <span style={{ color: ACTIVE, fontWeight: 600 }}>
                                            {value}h
                                        </span>
                                    )}
                                />
                            }
                        />
                        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                            {data.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={entry.hours === maxHours ? ACTIVE : DIM}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}