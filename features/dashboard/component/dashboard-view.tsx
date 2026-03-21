/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import ActivityFeed from "@/features/dashboard/component/activity-feed";
import DashboardRightPanel from "@/features/dashboard/component/dashboard-tab";
import TrainingCalendar from "@/features/dashboard/component/training-calendar";
import SalaryEligibilityOverview from "@/features/dashboard/component/salary-eligibility-overview";
import AdminDashboardView from "@/features/dashboard/component/admin-dashboard-view";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import {
    ArrowRight,
    CalendarDays,
    GraduationCap,
    Users,
    LayoutGrid,
    ShieldCheck,
    CalendarRange,
    TrendingUp,
    Zap,
} from "lucide-react";

import type { TeacherEligibilityRow } from "@/lib/database/salary-eligibility";
import type { AdminDashboardStats } from "@/lib/database/admin-dashboard";
import type { AdminCalendarEvent } from "@/lib/database/calendar";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"] as const;

type Props = {
    role: string | null;
    viewerId: string;
    stats: {
        totalProfiles: number;
        totalTrainings: number;
        totalSeminars: number;
    };
    events: any[];
    activity: any[];
    eligibilityData: TeacherEligibilityRow[];
    eligibilityCount: number;
    adminStats: AdminDashboardStats | null;
    adminEvents: AdminCalendarEvent[];
};

export default function DashboardView({
    role,
    viewerId,
    stats,
    events,
    activity,
    eligibilityData,
    eligibilityCount,
    adminStats,
    adminEvents,
}: Props) {
    const [scrolled, setScrolled] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [eligibilityOpen, setEligibilityOpen] = useState(false);

    const isAdmin = ADMIN_ROLES.includes(role as any);

    const eligibleCount = eligibilityData.filter(
        (r) => r.status === "ELIGIBLE",
    ).length;
    const approachingCount = eligibilityData.filter(
        (r) => r.status === "APPROACHING",
    ).length;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 18);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* ── Sticky top strip ── */}
            <div
                className={[
                    "sticky top-0 z-40 w-full",
                    "bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                    "transition-all duration-200",
                    scrolled
                        ? "border-b shadow-sm"
                        : "border-b border-transparent",
                ].join(" ")}
            >
                <div
                    className={[
                        "mx-auto w-full max-w-7xl px-4 md:px-6",
                        scrolled ? "py-3" : "py-5",
                        "transition-all duration-200",
                    ].join(" ")}
                >
                    {/* Mobile */}
                    <div className="flex items-center justify-between gap-2 md:hidden">
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant="secondary">
                                    {role ?? "USER"}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                    Dashboard
                                </Badge>
                            </div>
                            <h1
                                className={[
                                    "font-semibold tracking-tight transition-all duration-200",
                                    scrolled ? "text-xl" : "text-2xl",
                                ].join(" ")}
                            >
                                EduTrack
                            </h1>
                        </div>
                        {isAdmin && (
                            <div className="flex flex-col gap-1 shrink-0">
                                <Button
                                    asChild
                                    variant="secondary"
                                    size="sm"
                                    className="h-7 px-2.5 text-xs"
                                >
                                    <Link href="/account-approval">
                                        Approvals
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className="h-7 px-2.5 text-xs"
                                >
                                    <Link
                                        href="/admin-actions"
                                        className="gap-1"
                                    >
                                        Admin <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">
                                    {role ?? "USER"}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                    Dashboard
                                </Badge>
                            </div>
                            <h1
                                className={[
                                    "font-semibold tracking-tight transition-all duration-200",
                                    scrolled
                                        ? "text-xl md:text-2xl"
                                        : "text-2xl md:text-3xl",
                                ].join(" ")}
                            >
                                EduTrack
                            </h1>
                        </div>
                        {isAdmin && (
                            <div className="flex flex-row gap-2">
                                <Button asChild variant="secondary">
                                    <Link href="/account-approval">
                                        Account approvals
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link
                                        href="/admin-actions"
                                        className="gap-2"
                                    >
                                        Admin actions{" "}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Admin dashboard ── */}
            {isAdmin && adminStats ? (
                <AdminDashboardView
                    role={role}
                    viewerId={viewerId}
                    adminStats={adminStats}
                    activity={activity}
                    eligibilityData={eligibilityData}
                    eligibilityCount={eligibilityCount}
                    adminEvents={adminEvents}
                />
            ) : (
                /* ── Teacher dashboard ── */
                <>
                    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6">
                        <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-4 lg:items-start">
                            {/* LEFT COLUMN */}
                            <div className="space-y-4 min-w-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.22 }}
                                    className="grid gap-2 grid-cols-1 sm:grid-cols-3 items-stretch"
                                >
                                    <StatCard
                                        title="Profiles"
                                        desc="Teachers in system"
                                        value={stats.totalProfiles}
                                        icon={Users}
                                        color="blue"
                                    />
                                    <StatCard
                                        title="Trainings"
                                        desc="Assigned / completed"
                                        value={stats.totalTrainings}
                                        icon={GraduationCap}
                                        color="teal"
                                    />
                                    <StatCard
                                        title="Seminars"
                                        desc="Records logged"
                                        value={stats.totalSeminars}
                                        icon={CalendarDays}
                                        color="violet"
                                    />
                                </motion.div>

                                {/* Focus card */}
                                <Card className="overflow-hidden border-border/60">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-amber-400" />
                                            Focus
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Today's quick view. Minimal, no
                                            clutter.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="grid gap-3 grid-cols-2">
                                            <MiniTile
                                                label="Activity items"
                                                value={activity.length}
                                                icon={
                                                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                                                }
                                                color="amber"
                                            />
                                            <MiniTile
                                                label="Calendar items"
                                                value={events.length}
                                                icon={
                                                    <CalendarRange className="h-3.5 w-3.5 text-blue-400" />
                                                }
                                                color="blue"
                                            />
                                        </div>
                                        <Separator className="my-4" />
                                        <div className="text-sm text-muted-foreground">
                                            Tip: if something needs attention,
                                            it should appear in your Activity
                                            feed.
                                        </div>
                                    </CardContent>
                                </Card>

                                <ActivityFeed
                                    rows={activity as any}
                                    role={role}
                                    viewerId={viewerId}
                                />
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="hidden lg:block lg:sticky lg:top-[5rem] self-start min-w-0">
                                <TrainingCalendar events={events} />
                            </div>
                        </div>
                    </div>

                    {/* Mobile FABs */}
                    <div className="lg:hidden fixed bottom-6 right-4 z-50 flex flex-col gap-2 items-end">
                        <button
                            onClick={() => setCalendarOpen(true)}
                            className="flex items-center gap-2 rounded-full shadow-lg bg-card border border-border/80 px-4 py-2.5 hover:bg-accent/50 transition-colors text-sm font-medium"
                        >
                            <CalendarRange className="h-4 w-4 text-muted-foreground" />
                            <span>Calendar</span>
                            {events.length > 0 && (
                                <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-muted text-muted-foreground border border-border/60 text-[10px] font-bold px-1">
                                    {events.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Calendar Sheet */}
                    <Sheet open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <SheetContent
                            side="bottom"
                            className="h-[85vh] rounded-t-2xl overflow-y-auto p-0"
                        >
                            <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/60 sticky top-0 bg-background z-10">
                                <SheetTitle className="text-sm flex items-center gap-2">
                                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                                    Training Calendar
                                </SheetTitle>
                            </SheetHeader>
                            <div className="p-4">
                                <TrainingCalendar events={events} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </>
            )}

            {/* Eligibility Sheet */}
            {isAdmin && (
                <Sheet open={eligibilityOpen} onOpenChange={setEligibilityOpen}>
                    <SheetContent
                        side="bottom"
                        className="h-[85vh] rounded-t-2xl overflow-y-auto p-0"
                    >
                        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/60 sticky top-0 bg-background z-10">
                            <SheetTitle className="text-sm flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                Salary Eligibility
                            </SheetTitle>
                        </SheetHeader>
                        <div className="p-4">
                            <SalaryEligibilityOverview
                                data={eligibilityData}
                                count={eligibilityCount}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </div>
    );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    teal: "border-teal-500/20 bg-teal-500/10 text-teal-400",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-400",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-400",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

function StatCard({
    title,
    desc,
    value,
    icon: Icon,
    color = "blue",
}: {
    title: string;
    desc: string;
    value: number;
    icon: React.ElementType;
    color?: keyof typeof COLOR_MAP;
}) {
    const iconCls = COLOR_MAP[color] ?? COLOR_MAP.blue;
    return (
        <Card className="border border-border/60 bg-card/80 overflow-hidden">
            <CardContent className="p-3 sm:p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div
                        className={`rounded-lg p-1.5 shrink-0 border ${iconCls}`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-2xl font-bold tabular-nums tracking-tight leading-none text-foreground">
                        {value}
                    </span>
                </div>
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
}

// ── MiniTile ──────────────────────────────────────────────────────────────────

function MiniTile({
    label,
    value,
    icon,
    color = "muted",
}: {
    label: string;
    value: number;
    icon?: React.ReactNode;
    color?: "amber" | "blue" | "muted";
}) {
    const valueCls =
        color === "amber"
            ? "text-amber-400"
            : color === "blue"
              ? "text-blue-400"
              : "text-foreground";
    return (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {icon}
                {label}
            </div>
            <div
                className={`mt-1 text-lg font-semibold tabular-nums ${valueCls}`}
            >
                {value}
            </div>
        </div>
    );
}
