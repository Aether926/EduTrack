/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

                            <div className="flex items-end gap-3">
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

                                <div
                                    className={[
                                        "text-sm text-muted-foreground transition-all duration-200",
                                        scrolled ? "hidden md:block" : "block",
                                    ].join(" ")}
                                ></div>
                            </div>
                        </div>

                        {role === "ADMIN" ? (
                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="w-full sm:w-auto"
                                >
                                    <Link href="/account-approval">
                                        Account approvals
                                    </Link>
                                </Button>
                                <Button asChild className="w-full sm:w-auto">
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
                <div className="grid gap-4 xl:grid-cols-[1fr_420px] 2xl:grid-cols-[1fr_460px] xl:items-start">
                    {/* calendar first on mobile/tablet */}
                    <div className="order-1 xl:order-2 xl:sticky xl:top-24 self-start min-w-0 xl:h-[calc(100vh-7rem)]">
                        <div className="w-full max-w-full xl:max-w-[460px] h-full overflow-y-auto overscroll-contain">
                            <TrainingCalendar events={events} />
                        </div>
                    </div>

                    {/* content */}
                    <div className="order-2 xl:order-1 space-y-4 min-w-0">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            <StatCard
                                title="Profiles"
                                desc="Teachers in system"
                                value={stats.totalProfiles}
                                icon={
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                }
                            />
                            <StatCard
                                title="Trainings"
                                desc="Assigned / completed"
                                value={stats.totalTrainings}
                                icon={
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                }
                            />
                            <StatCard
                                title="Seminars"
                                desc="Records logged"
                                value={stats.totalSeminars}
                                icon={
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                }
                            />
                        </motion.div>

                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                    Focus
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Today’s quick view. Minimal, no clutter.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <MiniTile
                                        label="Activity items"
                                        value={activity.length}
                                    />
                                    <MiniTile
                                        label="Calendar items"
                                        value={events.length}
                                    />
                                </div>
                                <Separator className="my-4" />
                                <div className="text-sm text-muted-foreground">
                                    Tip: if something needs attention, it should
                                    appear in your Activity feed.
                                </div>
                            </CardContent>
                        </Card>

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

function StatCard({
    title,
    desc,
    value,
    icon,
}: {
    title: string;
    desc: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <Card className="overflow-hidden min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1 min-w-0">
                    <CardTitle className="text-sm">{title}</CardTitle>
                    <CardDescription className="text-xs">
                        {desc}
                    </CardDescription>
                </div>
                <div className="rounded-md border bg-card p-2 shrink-0">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
        </Card>
    );
}

function MiniTile({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border bg-card p-3 min-w-0">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-lg font-semibold">{value}</div>
        </div>
    );
}
