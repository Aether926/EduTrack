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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card, CardContent, CardHeader,
    CardTitle, CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import {
    ArrowRight, CalendarDays, GraduationCap, Users,
    LayoutGrid, ShieldCheck, CalendarRange, TrendingUp,
} from "lucide-react";

import type { TeacherEligibilityRow } from "@/lib/database/salary-eligibility";

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
};

export default function DashboardView({
    role,
    viewerId,
    stats,
    events,
    activity,
    eligibilityData,
    eligibilityCount,
}: Props) {
    const [scrolled, setScrolled] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [eligibilityOpen, setEligibilityOpen] = useState(false);

    const eligibleCount = eligibilityData.filter((r) => r.status === "ELIGIBLE").length;
    const approachingCount = eligibilityData.filter((r) => r.status === "APPROACHING").length;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 18);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const eligibilityBadge = eligibleCount > 0
        ? { label: String(eligibleCount), color: "bg-emerald-500" }
        : approachingCount > 0
            ? { label: String(approachingCount), color: "bg-amber-500" }
            : null;

    return (
        <div className="min-h-screen bg-background">
            {/* ── Sticky top strip ── */}
            <div className={[
                "sticky top-0 z-40 w-full",
                "bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                "transition-all duration-200",
                scrolled ? "border-b shadow-sm" : "border-b border-transparent",
            ].join(" ")}>
                <div className={[
                    "mx-auto w-full max-w-7xl px-4 md:px-6",
                    scrolled ? "py-3" : "py-5",
                    "transition-all duration-200",
                ].join(" ")}>
                    {/* Mobile */}
                    <div className="flex items-center justify-between gap-2 md:hidden">
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant="secondary">{role ?? "USER"}</Badge>
                                <Badge variant="outline" className="gap-1">
                                    <LayoutGrid className="h-3.5 w-3.5" />Dashboard
                                </Badge>
                            </div>
                            <h1 className={["font-semibold tracking-tight transition-all duration-200", scrolled ? "text-xl" : "text-2xl"].join(" ")}>
                                EduTrack
                            </h1>
                        </div>
                        {role === "ADMIN" && (
                            <div className="flex flex-col gap-1 shrink-0">
                                <Button asChild variant="secondary" size="sm" className="h-7 px-2.5 text-xs">
                                    <Link href="/account-approval">Approvals</Link>
                                </Button>
                                <Button asChild size="sm" className="h-7 px-2.5 text-xs">
                                    <Link href="/admin-actions" className="gap-1">
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
                                <Badge variant="secondary">{role ?? "USER"}</Badge>
                                <Badge variant="outline" className="gap-1">
                                    <LayoutGrid className="h-3.5 w-3.5" />Dashboard
                                </Badge>
                            </div>
                            <h1 className={["font-semibold tracking-tight transition-all duration-200", scrolled ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"].join(" ")}>
                                EduTrack
                            </h1>
                        </div>
                        {role === "ADMIN" && (
                            <div className="flex flex-row gap-2">
                                <Button asChild variant="secondary">
                                    <Link href="/account-approval">Account approvals</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/admin-actions" className="gap-2">
                                        Admin actions <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6">
                <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-4 lg:items-start">

                    {/* ── LEFT COLUMN — scrolls naturally with the page ── */}
                    <div className="space-y-4 min-w-0">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                            className="grid gap-2 grid-cols-1 sm:grid-cols-3 items-stretch"
                        >
                            <StatCard title="Profiles" desc="Teachers in system" value={stats.totalProfiles} icon={<Users className="h-4 w-4" />} accent="blue" />
                            <StatCard title="Trainings" desc="Assigned / completed" value={stats.totalTrainings} icon={<GraduationCap className="h-4 w-4" />} accent="violet" />
                            <StatCard title="Seminars" desc="Records logged" value={stats.totalSeminars} icon={<CalendarDays className="h-4 w-4" />} accent="emerald" />
                        </motion.div>

                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                                    Focus
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Today's quick view. Minimal, no clutter.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid gap-3 grid-cols-2">
                                    <MiniTile label="Activity items" value={activity.length} accent="amber" />
                                    <MiniTile label="Calendar items" value={events.length} accent="orange" />
                                </div>
                                <Separator className="my-4" />
                                <div className="text-sm text-muted-foreground">
                                    Tip: if something needs attention, it should appear in your Activity feed.
                                </div>
                            </CardContent>
                        </Card>

                        <ActivityFeed
                            rows={activity as any}
                            role={role}
                            viewerId={viewerId}
                        />
                    </div>

                    {/* ── RIGHT COLUMN — single tabbed card, sticky ── */}
                    <div className="hidden lg:block lg:sticky lg:top-[5rem] self-start min-w-0">
                        {role === "ADMIN" ? (
                            <DashboardRightPanel
                                events={events}
                                eligibilityData={eligibilityData}
                                eligibilityCount={eligibilityCount}
                            />
                        ) : (
                            // Non-admin users only see the calendar, no tabs needed
                            <TrainingCalendar events={events} />
                        )}
                    </div>

                </div>
            </div>

            {/* ── Mobile FABs ── */}
            <div className="lg:hidden fixed bottom-6 right-4 z-50 flex flex-col gap-2 items-end">
                <button
                    onClick={() => setCalendarOpen(true)}
                    className="flex items-center gap-2 rounded-full shadow-lg bg-card border border-border/80 px-4 py-2.5 hover:bg-accent/50 transition-colors text-sm font-medium"
                >
                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                    <span>Calendar</span>
                    {events.length > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-sky-500 text-white text-[10px] font-bold px-1">
                            {events.length}
                        </span>
                    )}
                </button>

                {role === "ADMIN" && (
                    <button
                        onClick={() => setEligibilityOpen(true)}
                        className="relative flex items-center gap-2 rounded-full shadow-lg bg-card border border-border/80 px-4 py-2.5 hover:bg-accent/50 transition-colors text-sm font-medium"
                    >
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span>Eligibility</span>
                        {eligibilityBadge && (
                            <span className={`inline-flex items-center justify-center h-5 min-w-5 rounded-full ${eligibilityBadge.color} text-white text-[10px] font-bold px-1`}>
                                {eligibilityBadge.label}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* ── Calendar Sheet (mobile) ── */}
            <Sheet open={calendarOpen} onOpenChange={setCalendarOpen}>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto p-0">
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

            {/* ── Eligibility Sheet (mobile) ── */}
            {role === "ADMIN" && (
                <Sheet open={eligibilityOpen} onOpenChange={setEligibilityOpen}>
                    <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto p-0">
                        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/60 sticky top-0 bg-background z-10">
                            <SheetTitle className="text-sm flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
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

const accentMap = {
    blue: { border: "border-blue-500/30", iconBg: "bg-blue-500/10 border-blue-500/20", iconColor: "text-blue-400", bar: "bg-blue-500", value: "text-blue-400" },
    violet: { border: "border-violet-500/30", iconBg: "bg-violet-500/10 border-violet-500/20", iconColor: "text-violet-400", bar: "bg-violet-500", value: "text-violet-400" },
    sky: { border: "border-sky-500/30", iconBg: "bg-sky-500/10 border-sky-500/20", iconColor: "text-sky-400", bar: "bg-sky-500", value: "text-sky-400" },
    emerald: { border: "border-emerald-500/30", iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400", bar: "bg-emerald-500", value: "text-emerald-400" },
} as const;

function StatCard({ title, desc, value, icon, accent = "blue" }: {
    title: string; desc: string; value: number; icon: React.ReactNode; accent?: keyof typeof accentMap;
}) {
    const a = accentMap[accent];
    return (
        <Card className={`px-3 overflow-hidden min-w-0 border ${a.border} flex flex-col`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 p-3 sm:items-start sm:p-4 sm:pb-2 lg:p-2 lg:pb-1">
                <div className="flex items-center gap-3 min-w-0 flex-1 sm:hidden pl-2">
                    <div className={`rounded-md border p-1.5 shrink-0 ${a.iconBg} ${a.iconColor}`}>{icon}</div>
                    <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                        <CardDescription className="text-xs leading-snug line-clamp-1">{desc}</CardDescription>
                    </div>
                </div>
                <div className="hidden sm:block space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold line-clamp-2 lg:text-sm">{title}</CardTitle>
                    <CardDescription className="text-xs leading-snug line-clamp-2">{desc}</CardDescription>
                </div>
                <div className="sm:hidden flex items-center shrink-0" style={{ width: "30%", justifyContent: "center" }}>
                    <div className={`text-2xl font-bold tabular-nums ${a.value}`}>{value}</div>
                </div>
                <div className={`rounded-md border p-1.5 shrink-0 hidden sm:block ${a.iconBg} ${a.iconColor}`}>{icon}</div>
            </CardHeader>
            <CardContent className="hidden sm:block pt-0 pb-2 px-1 md:px-4 mt-auto lg:pb-0">
                <div className={`text-3xl font-bold tabular-nums ${a.value}`}>{value}</div>
            </CardContent>
        </Card>
    );
}

// ── MiniTile ──────────────────────────────────────────────────────────────────

const miniAccentMap = {
    blue: { border: "border-blue-500/30", value: "text-blue-400" },
    violet: { border: "border-violet-500/30", value: "text-violet-400" },
    emerald: { border: "border-emerald-500/30", value: "text-emerald-400" },
    amber: { border: "border-amber-500/30", value: "text-amber-400" },
    sky: { border: "border-sky-500/30", value: "text-sky-400" },
    orange: { border: "border-orange-500/30", value: "text-orange-400" },
} as const;

function MiniTile({ label, value, accent = "blue" }: {
    label: string; value: number; accent?: keyof typeof miniAccentMap;
}) {
    const a = miniAccentMap[accent];
    return (
        <div className={`rounded-lg border ${a.border} bg-card p-3 min-w-0`}>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`mt-1 text-lg font-semibold ${a.value}`}>{value}</div>
        </div>
    );
}