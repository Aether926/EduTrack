/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cell, Label, Pie, PieChart } from "recharts";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
    Users,
    ClipboardCheck,
    FileText,
    UserCheck,
    ArrowRight,
    ShieldAlert,
    FileClock,
    TrendingUp,
    History,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
} from "lucide-react";

import type { AdminDashboardStats } from "@/lib/database/admin-dashboard";
import type { TeacherEligibilityRow } from "@/lib/database/salary-eligibility";
import type { AdminCalendarEvent } from "@/lib/database/calendar";
import ActivityFeed from "@/features/dashboard/component/activity-feed";
import TrainingHoursChart from "@/features/dashboard/component/training-hours-chart";
import AdminTrainingCalendar from "@/features/dashboard/component/admin-training-calendar";

type DonutSlice = { name: string; value: number; color: string };

// ── Compliance Card ────────────────────────────────────────────────────────────
function ComplianceCard({
    slices,
    total,
    viewHref,
}: {
    slices: DonutSlice[];
    total: number;
    viewHref: string;
}) {
    const config = Object.fromEntries(
        slices.map((s) => [s.name, { label: s.name, color: s.color }]),
    ) as ChartConfig;
    const data = slices.map((s) => ({ ...s, fill: s.color }));
    const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
    const compliantPct = pct(slices[0]?.value ?? 0);

    return (
        <Card className="flex gap-3 bg-card/80 border-amber-500/20 h-full overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/60 to-amber-500/10" />
            <CardHeader className="pb-3 px-5 pt-4">
                {" "}
                <div className="flex items-start gap-2">
                    <div className="rounded-lg p-1.5 bg-amber-500/10 mt-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-semibold">
                            Training Compliance
                        </CardTitle>
                        <CardDescription className="text-xs min-h-[32px]">
                            Status across all teachers
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-2 pt-0">
                <style>{`
                  .insight-body { container-type: inline-size; }
                  @container (min-width: 380px) {
                    .insight-inner { flex-direction: row !important; align-items: center !important; }
                    .insight-legend { flex: 1; width: auto !important; }
                  }
                `}</style>
                <div className="insight-body">
                    <div className="insight-inner flex flex-col items-stretch gap-4 min-h-[148px]">
                        <div className="relative shrink-0 mx-auto">
                            <ChartContainer
                                config={config}
                                className="h-[120px] w-[120px]"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                hideLabel
                                                formatter={(value, name) => (
                                                    <span
                                                        style={{
                                                            color:
                                                                config[name]
                                                                    ?.color ??
                                                                "#fff",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {name}: {value} (
                                                        {pct(Number(value))}%)
                                                    </span>
                                                )}
                                            />
                                        }
                                    />
                                    <Pie
                                        data={data.filter((d) => d.value > 0)}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={46}
                                        outerRadius={58}
                                        paddingAngle={2}
                                        startAngle={90}
                                        endAngle={-270}
                                        strokeWidth={0}
                                    >
                                        {data
                                            .filter((d) => d.value > 0)
                                            .map((d, i) => (
                                                <Cell key={i} fill={d.color} />
                                            ))}
                                        <Label
                                            content={({ viewBox }) => {
                                                if (
                                                    !viewBox ||
                                                    !("cx" in viewBox)
                                                )
                                                    return null;
                                                const { cx, cy } = viewBox as {
                                                    cx: number;
                                                    cy: number;
                                                };
                                                return (
                                                    <g>
                                                        <text
                                                            x={cx}
                                                            y={cy - 8}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            className="fill-emerald-500 dark:fill-emerald-400"
                                                            style={{
                                                                fontSize: 22,
                                                                fontWeight: 800,
                                                            }}
                                                        >
                                                            {compliantPct}%
                                                        </text>
                                                        <text
                                                            x={cx}
                                                            y={cy + 12}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            className="fill-muted-foreground"
                                                            style={{
                                                                fontSize: 10,
                                                            }}
                                                        >
                                                            compliant
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </div>
                        <div className="flex flex-col justify-between insight-legend w-full min-w-0 min-h-[148px] space-y-2.5">
                            {slices.map((d) => (
                                <div key={d.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="h-1.5 w-1.5 rounded-full shrink-0"
                                                style={{ background: d.color }}
                                            />
                                            <span className="text-foreground/70">
                                                {d.name}
                                            </span>
                                        </div>
                                        <span
                                            className="font-semibold tabular-nums"
                                            style={{ color: d.color }}
                                        >
                                            {d.value}{" "}
                                            <span className="text-muted-foreground/50 font-normal">
                                                {pct(d.value)}%
                                            </span>
                                        </span>
                                    </div>
                                    <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${pct(d.value)}%`,
                                                background: d.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between mt-1 h-8 text-xs text-muted-foreground hover:text-foreground border border-border/40"
                            >
                                <Link href={viewHref}>
                                    View report{" "}
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Document Card ──────────────────────────────────────────────────────────────
function DocumentCard({
    slices,
    total,
    viewHref,
}: {
    slices: DonutSlice[];
    total: number;
    viewHref: string;
}) {
    const config = Object.fromEntries(
        slices.map((s) => [s.name, { label: s.name, color: s.color }]),
    ) as ChartConfig;
    const data = slices.map((s) => ({ ...s, fill: s.color }));
    const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
    const icons: Record<string, React.ElementType> = {
        Approved: CheckCircle2,
        Pending: Clock,
        Rejected: XCircle,
        Missing: AlertTriangle,
    };

    return (
        <Card className="flex gap-3 bg-card/80 border-orange-500/20 h-full overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-orange-500/60 to-orange-500/10" />
            <CardHeader className="pb-3 px-5 pt-4">
                <div className="flex items-start gap-2">
                    <div className="rounded-lg p-1.5 bg-orange-500/10 mt-1.5">
                        <FileText className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-semibold">
                            Document Status
                        </CardTitle>
                        <CardDescription className="text-xs min-h-[32px]">
                            Required docs across all teachers
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-2 pt-0">
                <div className="insight-body">
                    <div className="insight-inner flex flex-col items-stretch gap-4 min-h-[148px]">
                        <ChartContainer
                            config={config}
                            className="h-[120px] w-[120px] shrink-0 mx-auto"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            hideLabel
                                            formatter={(value, name) => (
                                                <span
                                                    style={{
                                                        color:
                                                            config[name]
                                                                ?.color ??
                                                            "#fff",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {name}: {value} (
                                                    {pct(Number(value))}%)
                                                </span>
                                            )}
                                        />
                                    }
                                />
                                <Pie
                                    data={data.filter((d) => d.value > 0)}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={36}
                                    outerRadius={58}
                                    paddingAngle={3}
                                    startAngle={90}
                                    endAngle={-270}
                                    strokeWidth={0}
                                >
                                    {data
                                        .filter((d) => d.value > 0)
                                        .map((d, i) => (
                                            <Cell key={i} fill={d.color} />
                                        ))}
                                    <Label
                                        content={({ viewBox }) => {
                                            if (!viewBox || !("cx" in viewBox))
                                                return null;
                                            const { cx, cy } = viewBox as {
                                                cx: number;
                                                cy: number;
                                            };
                                            return (
                                                <g>
                                                    <text
                                                        x={cx}
                                                        y={cy - 7}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        className="fill-foreground"
                                                        style={{
                                                            fontSize: 20,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {total}
                                                    </text>
                                                    <text
                                                        x={cx}
                                                        y={cy + 11}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        className="fill-muted-foreground"
                                                        style={{ fontSize: 10 }}
                                                    >
                                                        total
                                                    </text>
                                                </g>
                                            );
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                        <div className="insight-legend w-full min-w-0 space-y-2">
                            {slices.map((d) => {
                                const Icon = icons[d.name] ?? FileText;
                                return (
                                    <div
                                        key={d.name}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div
                                                className="rounded p-0.5"
                                                style={{
                                                    background: `${d.color}20`,
                                                }}
                                            >
                                                <Icon
                                                    className="h-3 w-3 shrink-0"
                                                    style={{ color: d.color }}
                                                />
                                            </div>
                                            <span className="text-xs text-foreground/70">
                                                {d.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                                            <span
                                                className="text-sm font-semibold"
                                                style={{ color: d.color }}
                                            >
                                                {d.value}
                                            </span>
                                            <span className="text-xs text-muted-foreground/50 w-7 text-right">
                                                {pct(d.value)}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between mt-1 h-8 text-xs text-muted-foreground hover:text-foreground border border-border/40"
                            >
                                <Link href={viewHref}>
                                    View docs <ArrowRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Salary Card ────────────────────────────────────────────────────────────────
function SalaryCard({
    slices,
    total,
    eligibleCount,
    viewHref,
}: {
    slices: DonutSlice[];
    total: number;
    eligibleCount: number;
    viewHref: string;
}) {
    const config = Object.fromEntries(
        slices.map((s) => [s.name, { label: s.name, color: s.color }]),
    ) as ChartConfig;
    const data = slices.map((s) => ({ ...s, fill: s.color }));
    const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

    return (
        <Card className="flex gap-3 bg-card/80 border-emerald-500/20 h-full overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/60 to-emerald-500/10" />
            <CardHeader className="pb-3 px-5 pt-4">
                <div className="flex items-start gap-2">
                    <div className="rounded-lg p-1.5 bg-emerald-500/10 mt-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-semibold">
                            Salary Eligibility
                        </CardTitle>
                        <CardDescription className="text-xs min-h-[32px]">
                            Step increment status
                        </CardDescription>
                    </div>
                    {eligibleCount > 0 && (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {eligibleCount} eligible
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-2 pt-0">
                <div className="insight-body">
                    <div className="insight-inner flex flex-col items-stretch gap-4 min-h-[148px]">
                        <div className="shrink-0 relative mx-auto">
                            <ChartContainer
                                config={config}
                                className="h-[120px] w-[120px]"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                hideLabel
                                                formatter={(value, name) => (
                                                    <span
                                                        style={{
                                                            color:
                                                                config[name]
                                                                    ?.color ??
                                                                "#fff",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {name}: {value} (
                                                        {pct(Number(value))}%)
                                                    </span>
                                                )}
                                            />
                                        }
                                    />
                                    <Pie
                                        data={[
                                            {
                                                value: 1,
                                                fill: "hsl(var(--muted)/0.3)",
                                            },
                                        ]}
                                        dataKey="value"
                                        cx="50%"
                                        cy="70%"
                                        innerRadius={44}
                                        outerRadius={58}
                                        startAngle={180}
                                        endAngle={0}
                                        strokeWidth={0}
                                        isAnimationActive={false}
                                    >
                                        <Cell fill="hsl(var(--muted)/0.2)" />
                                    </Pie>
                                    <Pie
                                        data={data.filter((d) => d.value > 0)}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="70%"
                                        innerRadius={44}
                                        outerRadius={58}
                                        paddingAngle={2}
                                        startAngle={180}
                                        endAngle={0}
                                        strokeWidth={0}
                                    >
                                        {data
                                            .filter((d) => d.value > 0)
                                            .map((d, i) => (
                                                <Cell key={i} fill={d.color} />
                                            ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                            <div className="absolute bottom-6 left-0 right-0 text-center">
                                <div className="text-xl font-bold text-emerald-400 tabular-nums">
                                    {eligibleCount}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    eligible
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between insight-legend w-full min-w-0 min-h-[148px] space-y-2.5">
                            {slices.map((d) => (
                                <div
                                    key={d.name}
                                    className="flex items-center justify-between gap-2 text-sm"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span
                                            className="h-2 w-2 rounded-full shrink-0"
                                            style={{ background: d.color }}
                                        />
                                        <span className="text-foreground/70 text-xs">
                                            {d.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                                        <span
                                            className="font-semibold"
                                            style={{ color: d.color }}
                                        >
                                            {d.value}
                                        </span>
                                        <span className="text-muted-foreground/50 text-xs w-7 text-right">
                                            {pct(d.value)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between mt-1 h-8 text-xs text-muted-foreground hover:text-foreground border border-border/40"
                            >
                                <Link href={viewHref}>
                                    View list <ArrowRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
    title,
    value,
    desc,
    icon: Icon,
    accent,
    href,
}: {
    title: string;
    value: number;
    desc: string;
    icon: React.ElementType;
    accent:
        | "blue"
        | "violet"
        | "emerald"
        | "amber"
        | "rose"
        | "sky"
        | "orange"
        | "teal";
    href?: string;
}) {
    const styles = {
        blue: {
            border: "border-blue-500/20",
            iconWrap: "bg-blue-500/10 text-blue-400",
            num: "text-blue-400",
        },
        violet: {
            border: "border-violet-500/20",
            iconWrap: "bg-violet-500/10 text-violet-400",
            num: "text-violet-400",
        },
        emerald: {
            border: "border-emerald-500/20",
            iconWrap: "bg-emerald-500/10 text-emerald-400",
            num: "text-emerald-400",
        },
        amber: {
            border: "border-amber-500/20",
            iconWrap: "bg-amber-500/10 text-amber-400",
            num: "text-amber-400",
        },
        rose: {
            border: "border-rose-500/20",
            iconWrap: "bg-rose-500/10 text-rose-400",
            num: "text-rose-400",
        },
        sky: {
            border: "border-sky-500/20",
            iconWrap: "bg-sky-500/10 text-sky-400",
            num: "text-sky-400",
        },
        orange: {
            border: "border-orange-500/20",
            iconWrap: "bg-orange-500/10 text-orange-400",
            num: "text-orange-400",
        },
        teal: {
            border: "border-teal-500/20",
            iconWrap: "bg-teal-500/10 text-teal-400",
            num: "text-teal-400",
        },
    } as const;
    const s = styles[accent];
    const inner = (
        <Card
            className={`border ${s.border} bg-card/80 overflow-hidden transition-all duration-200 ${href ? "hover:bg-accent/30 cursor-pointer" : ""}`}
        >
            <CardContent className="p-3 sm:p-4 h-[96px] flex flex-col justify-between">
                {/* Top: icon + value + arrow */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className={`rounded-lg p-1.5 shrink-0 ${s.iconWrap}`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span
                            className={`text-2xl font-bold tabular-nums tracking-tight leading-none ${s.num}`}
                        >
                            {value}
                        </span>
                    </div>
                    {href && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    )}
                </div>
                {/* Bottom: title + desc */}
                <div>
                    <div className="text-xs font-medium text-foreground/80 leading-tight">
                        {title}
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {desc}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
    return href ? (
        <Link href={href} className="block group">
            {inner}
        </Link>
    ) : (
        inner
    );
}

// ── Main ───────────────────────────────────────────────────────────────────────
type Props = {
    role: string | null;
    viewerId: string;
    adminStats: AdminDashboardStats;
    activity: any[];
    eligibilityData: TeacherEligibilityRow[];
    eligibilityCount: number;
    adminEvents: AdminCalendarEvent[];
};

export default function AdminDashboardView({
    role,
    viewerId,
    adminStats,
    activity,
    eligibilityData,
    eligibilityCount,
    adminEvents,
}: Props) {
    const {
        totalTeachers,
        pendingProofs,
        pendingHRRequests,
        pendingDocuments,
        pendingAccountApprovals,
        complianceBreakdown,
        documentBreakdown,
        trainingHoursPerMonth,
    } = adminStats;

    const totalCompliance =
        complianceBreakdown.compliant +
        complianceBreakdown.atRisk +
        complianceBreakdown.nonCompliant;
    const totalDocs =
        documentBreakdown.approved +
        documentBreakdown.pending +
        documentBreakdown.rejected +
        documentBreakdown.missing;

    const COMPLIANCE_DATA: DonutSlice[] = [
        {
            name: "Compliant",
            value: complianceBreakdown.compliant,
            color: "#10b981",
        },
        {
            name: "At Risk",
            value: complianceBreakdown.atRisk,
            color: "#f59e0b",
        },
        {
            name: "Non-Compliant",
            value: complianceBreakdown.nonCompliant,
            color: "#ef4444",
        },
    ];

    const DOC_DATA: DonutSlice[] = [
        {
            name: "Approved",
            value: documentBreakdown.approved,
            color: "#10b981",
        },
        { name: "Pending", value: documentBreakdown.pending, color: "#3b82f6" },
        {
            name: "Rejected",
            value: documentBreakdown.rejected,
            color: "#ef4444",
        },
        { name: "Missing", value: documentBreakdown.missing, color: "#f59e0b" },
    ];

    const eligibleCount = eligibilityData.filter(
        (r) => r.status === "ELIGIBLE",
    ).length;
    const approachingCount = eligibilityData.filter(
        (r) => r.status === "APPROACHING",
    ).length;
    const notYet = Math.max(
        totalTeachers - eligibleCount - approachingCount,
        0,
    );

    const SALARY_DATA: DonutSlice[] = [
        { name: "Eligible", value: eligibleCount, color: "#10b981" },
        { name: "Approaching", value: approachingCount, color: "#f59e0b" },
        { name: "On track", value: notYet, color: "#06b6d4" },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-5">
            {/* ── Stat cards ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
            >
                <StatCard
                    title="Teachers"
                    value={totalTeachers}
                    desc="Approved accounts"
                    icon={Users}
                    accent="blue"
                />
                <StatCard
                    title="HR Requests"
                    value={pendingHRRequests}
                    desc="Change requests"
                    icon={FileClock}
                    accent="violet"
                    href="/admin-actions/queue"
                />
                <StatCard
                    title="Appointment History"
                    value={(adminStats as any).totalAppointments ?? 0}
                    desc="Recorded changes"
                    icon={History}
                    accent="teal"
                    href="/admin-actions/appointment-history"
                />
                <StatCard
                    title="New Accounts"
                    value={pendingAccountApprovals}
                    desc="Need approval"
                    icon={UserCheck}
                    accent="emerald"
                    href="/account-approval"
                />
                <StatCard
                    title="Pending Proofs"
                    value={pendingProofs}
                    desc="Awaiting review"
                    icon={ClipboardCheck}
                    accent="amber"
                    href="/proof-review"
                />
                <StatCard
                    title="Documents"
                    value={pendingDocuments}
                    desc="Pending submission"
                    icon={FileText}
                    accent="orange"
                    href="/admin-actions"
                />
            </motion.div>

            {/* ── Bar chart + placeholder ── */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-[3fr_2fr]">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.06 }}
                >
                    <TrainingHoursChart
                        trainingHoursPerMonth={trainingHoursPerMonth}
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.09 }}
                >
                    <Card className="h-full bg-card/80 border-border/50 border-dashed flex items-center justify-center min-h-[220px]">
                        <p className="text-sm text-muted-foreground/40">
                            Coming soon
                        </p>
                    </Card>
                </motion.div>
            </div>

            {/* ── Insight cards ── */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.12 }}
                >
                    <ComplianceCard
                        slices={COMPLIANCE_DATA}
                        total={totalCompliance}
                        viewHref="/admin-actions/compliance"
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.15 }}
                >
                    <DocumentCard
                        slices={DOC_DATA}
                        total={totalDocs}
                        viewHref="/admin-actions/documents"
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.18 }}
                >
                    <SalaryCard
                        slices={SALARY_DATA}
                        total={totalTeachers}
                        eligibleCount={eligibleCount}
                        viewHref="/admin-actions/salary-increase-eligibility"
                    />
                </motion.div>
            </div>

            {/* ── Admin training calendar ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.2 }}
            >
                <AdminTrainingCalendar events={adminEvents} />
            </motion.div>

            {/* ── Activity feed ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.24 }}
            >
                <ActivityFeed rows={activity} role={role} viewerId={viewerId} />
            </motion.div>
        </div>
    );
}
