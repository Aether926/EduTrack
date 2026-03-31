"use client";

import { Users, ShieldCheck, Clock, ShieldX, Shield } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { InitialAvatar } from "@/components/ui-elements/user-avatar";
import { SecurityActionBadge } from "@/components/ui-elements/badges";
import type { SecurityLogEntry } from "../types";

// ── Types ──────────────────────────────────────────────────────────────────────

type Stats = {
    totalTeachers: number;
    totalAdmins: number;
    totalPending: number;
    totalSuspended: number;
    superadminCount: number;
};

export type LogUserMap = Record<
    string,
    { name: string; profileImage?: string | null }
>;

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(dt: string) {
    try {
        return new Intl.DateTimeFormat("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dt));
    } catch {
        return dt;
    }
}

function logDescription(log: SecurityLogEntry, name: string): string {
    const meta = log.meta ?? {};

    switch (log.action) {
        case "SIGNED_IN":
            return `${name} signed in`;
        case "SIGNED_OUT":
            return `${name} signed out`;
        case "SIGNED_UP":
            return `${name} created an account`;
        case "PASSWORD_CHANGED":
            return `${name} changed their password`;
        case "ACCOUNT_APPROVED":
            return `${name} was approved by ${meta.approved_by ?? "admin"}`;
        case "ACCOUNT_REJECTED":
            return `${name} was rejected by ${meta.rejected_by ?? "admin"}`;
        case "ACCOUNT_SUSPENDED":
            return `${name} was suspended — ${meta.reason ?? "no reason"}`;
        case "ACCOUNT_UNSUSPENDED":
            return `${name} was unsuspended by ${meta.unsuspended_by ?? "admin"}`;
        case "ROLE_PROMOTED":
            return `${name} promoted from ${meta.from_role} to ${meta.to_role}`;
        case "ROLE_DEMOTED":
            return `${name} demoted from ${meta.from_role} to ${meta.to_role}`;
        case "SUPERADMIN_PROMOTED":
            return `${name} promoted to Superadmin by ${meta.promoted_by ?? "admin"}`;
        default:
            return `${name} — ${log.action}`;
    }
}

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({
    title,
    value,
    desc,
    icon: Icon,
    accent,
}: {
    title: string;
    value: number | string;
    desc: string;
    icon: React.ElementType;
    accent: string;
}) {
    const accents: Record<
        string,
        { border: string; iconBg: string; iconColor: string; value: string }
    > = {
        teal: {
            border: "border-teal-500/30",
            iconBg: "bg-teal-500/10 border-teal-500/20",
            iconColor: "text-teal-400",
            value: "text-teal-400",
        },
        violet: {
            border: "border-violet-500/30",
            iconBg: "bg-violet-500/10 border-violet-500/20",
            iconColor: "text-violet-400",
            value: "text-violet-400",
        },
        amber: {
            border: "border-amber-500/30",
            iconBg: "bg-amber-500/10 border-amber-500/20",
            iconColor: "text-amber-400",
            value: "text-amber-400",
        },
        orange: {
            border: "border-orange-500/30",
            iconBg: "bg-orange-500/10 border-orange-500/20",
            iconColor: "text-orange-400",
            value: "text-orange-400",
        },
        rose: {
            border: "border-rose-500/30",
            iconBg: "bg-rose-500/10 border-rose-500/20",
            iconColor: "text-rose-400",
            value: "text-rose-400",
        },
    };

    const a = accents[accent] ?? accents.teal;

    return (
        <Card className={`border ${a.border} overflow-hidden`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                <div className={`rounded-md border p-1.5 ${a.iconBg}`}>
                    <Icon className={`h-4 w-4 ${a.iconColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-3xl font-bold tabular-nums ${a.value}`}>
                    {value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </CardContent>
        </Card>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SuperadminDashboardView({
    stats,
    logs,
    viewerId,
    userMap = {},
}: {
    stats: Stats;
    logs: SecurityLogEntry[];
    viewerId: string;
    userMap?: LogUserMap;
}) {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-6">
            {/* Header */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-rose-400/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 shrink-0">
                            <Shield className="h-5 w-5 text-rose-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                Superadmin Dashboard
                            </h1>
                            <p className="text-[13px] text-muted-foreground mt-0.5">
                                System overview and security activity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <StatCard
                    title="Teachers"
                    value={stats.totalTeachers}
                    desc="Approved teachers"
                    icon={Users}
                    accent="teal"
                />
                <StatCard
                    title="Admins"
                    value={stats.totalAdmins}
                    desc="Approved admins"
                    icon={ShieldCheck}
                    accent="violet"
                />
                <StatCard
                    title="Pending"
                    value={stats.totalPending}
                    desc="Awaiting approval"
                    icon={Clock}
                    accent="amber"
                />
                <StatCard
                    title="Suspended"
                    value={stats.totalSuspended}
                    desc="Suspended accounts"
                    icon={ShieldX}
                    accent="orange"
                />
                <StatCard
                    title="Superadmins"
                    value={`${stats.superadminCount}/3`}
                    desc="Slots used"
                    icon={Shield}
                    accent="rose"
                />
            </div>

            {/* Security log feed */}
            <Card className="overflow-hidden">
                <CardHeader className="border-b border-border/60">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-rose-400" />
                        Security Log
                    </CardTitle>
                    <CardDescription>
                        Last {logs.length} security events across all users
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 divide-y divide-border/40">
                    {logs.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No security events logged yet.
                        </p>
                    ) : (
                        logs.map((log) => {
                            const email = log.email ?? "";
                            const actor = userMap[email];
                            // Full name when found in map; email prefix as last resort
                            const name =
                                actor?.name?.trim() || email.split("@")[0];

                            return (
                                <div
                                    key={log.id}
                                    className="flex items-center gap-5 py-3 px-1"
                                >
                                    {/* Badge — fixed-width column, left-aligned */}
                                    <div className="w-36 shrink-0 flex justify-start">
                                        <SecurityActionBadge
                                            action={log.action}
                                            size="xs"
                                        />
                                    </div>

                                    {/* Avatar + dialogue — grouped */}
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        {/*
                                         * InitialAvatar drives color from the first letter of `name`.
                                         * "Edwin Jade" → first letter E → blue, always consistent.
                                         * Two different people named "Edwin" will both get blue,
                                         * which is correct — same letter, same color per avatar-color.tsx.
                                         */}
                                        <InitialAvatar
                                            name={name}
                                            src={
                                                actor?.profileImage ?? undefined
                                            }
                                            className="h-7 w-7 shrink-0"
                                        />

                                        <div className="min-w-0">
                                            <p className="text-sm text-foreground leading-snug truncate">
                                                {logDescription(log, name)}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <p className="text-[11px] text-muted-foreground">
                                                    {fmtDate(log.createdAt)}
                                                </p>
                                                {log.ipAddress && (
                                                    <p className="text-[11px] text-muted-foreground font-mono">
                                                        · {log.ipAddress}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
