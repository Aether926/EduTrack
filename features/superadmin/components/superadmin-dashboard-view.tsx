"use client";

import { Users, ShieldCheck, Clock, ShieldX, Shield } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SecurityLogEntry } from "../types";

// ── Types ──────────────────────────────────────────────────────────────────────

type Stats = {
    totalTeachers:   number;
    totalAdmins:     number;
    totalPending:    number;
    totalSuspended:  number;
    superadminCount: number;
};

// ── Action label map ───────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    SIGNED_IN: { label: "Signed in", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    SIGNED_OUT: { label: "Signed out", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
    SIGNED_UP: { label: "Signed up", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    PASSWORD_CHANGED: { label: "Password changed", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    ACCOUNT_APPROVED: { label: "Account approved", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    ACCOUNT_REJECTED: { label: "Account rejected", color: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
    ACCOUNT_SUSPENDED: { label: "Account suspended", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
    ACCOUNT_UNSUSPENDED: { label: "Account unsuspended", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    ROLE_PROMOTED: { label: "Role promoted", color: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
    ROLE_DEMOTED: { label: "Role demoted", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    SUPERADMIN_PROMOTED: { label: "Superadmin promoted", color: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
    ACCOUNT_ARCHIVED: { label: "Account archived", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
    ACCOUNT_RESTORED: { label: "Account restored", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    ACCOUNT_PERMANENTLY_DELETED: { label: "Permanently deleted", color: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
              
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(dt: string) {
    try {
        return new Intl.DateTimeFormat("en-PH", {
            year:   "numeric",
            month:  "short",
            day:    "numeric",
            hour:   "2-digit",
            minute: "2-digit",
        }).format(new Date(dt));
    } catch { return dt; }
}

function logDescription(log: SecurityLogEntry): string {
    const meta = log.meta ?? {};
    const email = log.email ?? "Unknown";

    switch (log.action) {
        case "SIGNED_IN":           return `${email} signed in`;
        case "SIGNED_OUT":          return `${email} signed out`;
        case "SIGNED_UP":           return `${email} created an account`;
        case "PASSWORD_CHANGED":    return `${email} changed their password`;
        case "ACCOUNT_APPROVED":    return `${email} was approved by ${meta.approved_by ?? "admin"}`;
        case "ACCOUNT_REJECTED":    return `${email} was rejected by ${meta.rejected_by ?? "admin"}`;
        case "ACCOUNT_SUSPENDED":   return `${email} was suspended — ${meta.reason ?? "no reason"}`;
        case "ACCOUNT_UNSUSPENDED": return `${email} was unsuspended by ${meta.unsuspended_by ?? "admin"}`;
        case "ROLE_PROMOTED":       return `${email} promoted from ${meta.from_role} to ${meta.to_role}`;
        case "ROLE_DEMOTED":        return `${email} demoted from ${meta.from_role} to ${meta.to_role}`;
        case "SUPERADMIN_PROMOTED": return `${email} promoted to Superadmin by ${meta.promoted_by ?? "admin"}`;
        default:                    return `${email} — ${log.action}`;
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
    title:  string;
    value:  number | string;
    desc:   string;
    icon:   React.ElementType;
    accent: string;
}) {
    const accents: Record<string, { border: string; iconBg: string; iconColor: string; value: string }> = {
        teal:   { border: "border-teal-500/30",   iconBg: "bg-teal-500/10 border-teal-500/20",   iconColor: "text-teal-400",   value: "text-teal-400"   },
        violet: { border: "border-violet-500/30", iconBg: "bg-violet-500/10 border-violet-500/20", iconColor: "text-violet-400", value: "text-violet-400" },
        amber:  { border: "border-amber-500/30",  iconBg: "bg-amber-500/10 border-amber-500/20",  iconColor: "text-amber-400",  value: "text-amber-400"  },
        orange: { border: "border-orange-500/30", iconBg: "bg-orange-500/10 border-orange-500/20", iconColor: "text-orange-400", value: "text-orange-400" },
        rose:   { border: "border-rose-500/30",   iconBg: "bg-rose-500/10 border-rose-500/20",   iconColor: "text-rose-400",   value: "text-rose-400"   },
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
}: {
    stats:    Stats;
    logs:     SecurityLogEntry[];
    viewerId: string;
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
                            const actionInfo = ACTION_LABELS[log.action] ?? {
                                label: log.action,
                                color: "bg-slate-500/15 text-slate-400 border-slate-500/30",
                            };

                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 py-3 px-1"
                                >
                                    <Badge
                                        className={`shrink-0 text-[10px] mt-0.5 ${actionInfo.color} hover:opacity-100`}
                                    >
                                        {actionInfo.label}
                                    </Badge>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-foreground leading-snug">
                                            {logDescription(log)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
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
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}