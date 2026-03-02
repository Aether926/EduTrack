/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import ActivityFeed from "@/features/dashboard/component/activity-feed";
import TrainingCalendar from "@/features/dashboard/component/training-calendar";

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
    ArrowRight,
    CalendarDays,
    GraduationCap,
    Users,
    LayoutGrid,
    ShieldCheck,
} from "lucide-react";

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
};

export default function DashboardView({
    role,
    viewerId,
    stats,
    events,
    activity,
}: Props) {
    const [scrolled, setScrolled] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const [calendarOverflows, setCalendarOverflows] = useState(false);

    useEffect(() => {
        const el = calendarRef.current;
        if (!el) return;
        const check = () =>
            setCalendarOverflows(el.scrollHeight > el.clientHeight);
        check();
        const ro = new ResizeObserver(check);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 18);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* sticky top strip */}
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
                    {/* Mobile: [badges+title] left | [buttons] right — single row */}
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
                        {role === "ADMIN" ? (
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
                        ) : null}
                    </div>

                    {/* Desktop: original layout */}
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
                        {role === "ADMIN" ? (
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
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6">
                {/* IMPORTANT: two-column starts at xl (not lg) so 1024px won't squeeze */}
                {/*
                  Mobile order: 1=stats+focus  2=calendar  3=activity
                  Desktop (lg+): left col = stats+focus+activity | right col = calendar sticky
                */}
                <div className="grid gap-4 lg:grid-cols-[3fr_2fr] xl:grid-cols-[3fr_2fr] lg:items-start">
                    {/* LEFT: stats + focus — order-1 on mobile */}
                    <div className="order-1 lg:order-1 space-y-4 min-w-0">
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
                                icon={<Users className="h-4 w-4" />}
                                accent="blue"
                            />
                            <StatCard
                                title="Trainings"
                                desc="Assigned / completed"
                                value={stats.totalTrainings}
                                icon={<GraduationCap className="h-4 w-4" />}
                                accent="violet"
                            />
                            <StatCard
                                title="Seminars"
                                desc="Records logged"
                                value={stats.totalSeminars}
                                icon={<CalendarDays className="h-4 w-4" />}
                                accent="emerald"
                            />
                        </motion.div>

                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                                    Focus
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Today’s quick view. Minimal, no clutter.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid gap-3 grid-cols-2">
                                    <MiniTile
                                        label="Activity items"
                                        value={activity.length}
                                        accent="amber"
                                    />
                                    <MiniTile
                                        label="Calendar items"
                                        value={events.length}
                                        accent="orange"
                                    />
                                </div>
                                <Separator className="my-4" />
                                <div className="text-sm text-muted-foreground">
                                    Tip: if something needs attention, it should
                                    appear in your Activity feed.
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity — desktop only here (sits below focus in left col) */}
                        <div className="hidden lg:block">
                            <ActivityFeed
                                rows={activity as any}
                                role={role}
                                viewerId={viewerId}
                            />
                        </div>
                    </div>

                    {/* RIGHT: calendar — order-2 on mobile (between focus & activity), sticky on desktop */}
                    <div className="order-2 lg:order-2 lg:sticky lg:top-24 self-start min-w-0 lg:h-[calc(100vh-7rem)]">
                        <div
                            ref={calendarRef}
                            className={[
                                "w-full max-w-full h-full overscroll-contain",
                                calendarOverflows
                                    ? "overflow-y-auto [&>*]:rounded-r-none [&>*]:border-r-0"
                                    : "overflow-y-visible",
                            ].join(" ")}
                        >
                            <TrainingCalendar events={events} />
                        </div>
                    </div>

                    {/* Activity — mobile only (order-3, after calendar) */}
                    <div className="order-3 lg:hidden min-w-0">
                        <ActivityFeed
                            rows={activity as any}
                            role={role}
                            viewerId={viewerId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const accentMap = {
    blue: {
        border: "border-blue-500/30",
        iconBg: "bg-blue-500/10 border-blue-500/20",
        iconColor: "text-blue-400",
        bar: "bg-blue-500",
        value: "text-blue-400",
    },
    violet: {
        border: "border-violet-500/30",
        iconBg: "bg-violet-500/10 border-violet-500/20",
        iconColor: "text-violet-400",
        bar: "bg-violet-500",
        value: "text-violet-400",
    },
    sky: {
        border: "border-sky-500/30",
        iconBg: "bg-sky-500/10 border-sky-500/20",
        iconColor: "text-sky-400",
        bar: "bg-sky-500",
        value: "text-sky-400",
    },
    emerald: {
        border: "border-emerald-500/30",
        iconBg: "bg-emerald-500/10 border-emerald-500/20",
        iconColor: "text-emerald-400",
        bar: "bg-emerald-500",
        value: "text-emerald-400",
    },
} as const;

function StatCard({
    title,
    desc,
    value,
    icon,
    accent = "blue",
}: {
    title: string;
    desc: string;
    value: number;
    icon: React.ReactNode;
    accent?: keyof typeof accentMap;
}) {
    const a = accentMap[accent];
    return (
        <Card
            className={`px-3 overflow-hidden min-w-0 border ${a.border} flex flex-col`}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 p-3 sm:items-start sm:p-4 sm:pb-2 lg:p-2 lg:pb-1">
                {/* mobile layout */}
                <div className="flex items-center gap-3 min-w-0 flex-1 sm:hidden pl-2">
                    <div
                        className={`rounded-md border p-1.5 shrink-0 ${a.iconBg} ${a.iconColor}`}
                    >
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-xs leading-snug line-clamp-1">
                            {desc}
                        </CardDescription>
                    </div>
                </div>
                {/* desktop layout title */}
                <div className="hidden sm:block space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold line-clamp-2 lg:text-sm">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-snug line-clamp-2">
                        {desc}
                    </CardDescription>
                </div>
                <div
                    className="sm:hidden flex items-center shrink-0"
                    style={{ width: "30%", justifyContent: "center" }}
                >
                    <div
                        className={`text-2xl font-bold tabular-nums ${a.value}`}
                    >
                        {value}
                    </div>
                </div>
                <div
                    className={`rounded-md border p-1.5 shrink-0 hidden sm:block ${a.iconBg} ${a.iconColor}`}
                >
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="hidden sm:block pt-0 pb-2 px-1 md:px-4 mt-auto lg:pb-0">
                <div className={`text-3xl font-bold tabular-nums ${a.value}`}>
                    {value}
                </div>
            </CardContent>
        </Card>
    );
}

const miniAccentMap = {
    blue: { border: "border-blue-500/30", value: "text-blue-400" },
    violet: { border: "border-violet-500/30", value: "text-violet-400" },
    emerald: { border: "border-emerald-500/30", value: "text-emerald-400" },
    amber: { border: "border-amber-500/30", value: "text-amber-400" },
    sky: { border: "border-sky-500/30", value: "text-sky-400" },
    orange: { border: "border-orange-500/30", value: "text-orange-400" },
} as const;

function MiniTile({
    label,
    value,
    accent = "blue",
}: {
    label: string;
    value: number;
    accent?: keyof typeof miniAccentMap;
}) {
    const a = miniAccentMap[accent];
    return (
        <div className={`rounded-lg border ${a.border} bg-card p-3 min-w-0`}>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`mt-1 text-lg font-semibold ${a.value}`}>
                {value}
            </div>
        </div>
    );
}
